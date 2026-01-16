using MediatR;
using MudListings.Application.DTOs.Admin;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;
using MudListings.Domain.Enums;
using MudListings.Domain.ValueObjects;

namespace MudListings.Application.Admin.Commands;

/// <summary>
/// Command to import MUDs from CSV data.
/// </summary>
public record ImportMudsCommand(
    IReadOnlyList<ImportMudRow> Rows,
    Guid ImporterUserId
) : IRequest<ImportResultDto>;

/// <summary>
/// Single row of import data.
/// </summary>
public record ImportMudRow(
    string Name,
    string Description,
    string Host,
    int Port,
    string? Website,
    string? Codebase,
    string? Language,
    string? Genres // Comma-separated
);

public class ImportMudsCommandHandler : IRequestHandler<ImportMudsCommand, ImportResultDto>
{
    private readonly IMudRepository _mudRepository;
    private readonly IAdminRepository _adminRepository;

    public ImportMudsCommandHandler(
        IMudRepository mudRepository,
        IAdminRepository adminRepository)
    {
        _mudRepository = mudRepository;
        _adminRepository = adminRepository;
    }

    public async Task<ImportResultDto> Handle(ImportMudsCommand request, CancellationToken cancellationToken)
    {
        var errors = new List<ImportErrorDto>();
        var successCount = 0;

        for (int i = 0; i < request.Rows.Count; i++)
        {
            var row = request.Rows[i];
            var rowNumber = i + 1; // 1-indexed for user display
            var rowErrors = new List<ImportErrorDto>();

            // Validate required fields
            if (string.IsNullOrWhiteSpace(row.Name))
            {
                rowErrors.Add(new ImportErrorDto(rowNumber, "Name", "Name is required."));
            }

            if (string.IsNullOrWhiteSpace(row.Description))
            {
                rowErrors.Add(new ImportErrorDto(rowNumber, "Description", "Description is required."));
            }

            if (string.IsNullOrWhiteSpace(row.Host))
            {
                rowErrors.Add(new ImportErrorDto(rowNumber, "Host", "Host is required."));
            }

            if (row.Port <= 0 || row.Port > 65535)
            {
                rowErrors.Add(new ImportErrorDto(rowNumber, "Port", "Port must be between 1 and 65535."));
            }

            // If there are validation errors, skip this row
            if (rowErrors.Count > 0)
            {
                errors.AddRange(rowErrors);
                continue;
            }

            // Check if MUD with same name exists
            var slug = Mud.GenerateSlug(row.Name);
            var slugExists = await _mudRepository.SlugExistsAsync(slug, null, cancellationToken);
            if (slugExists)
            {
                // Try to make slug unique
                slug = $"{slug}-{Guid.NewGuid().ToString()[..8]}";
            }

            try
            {
                var mud = new Mud
                {
                    Id = Guid.NewGuid(),
                    Name = row.Name.Trim(),
                    Slug = slug,
                    Description = row.Description.Trim(),
                    Connection = new ConnectionInfo
                    {
                        Host = row.Host.Trim(),
                        Port = row.Port
                    },
                    Website = row.Website?.Trim(),
                    Codebase = row.Codebase?.Trim(),
                    Language = row.Language?.Trim(),
                    CreatedAt = DateTime.UtcNow
                };

                // Parse genres
                if (!string.IsNullOrWhiteSpace(row.Genres))
                {
                    var genreStrings = row.Genres.Split(',', StringSplitOptions.RemoveEmptyEntries);
                    foreach (var genreStr in genreStrings)
                    {
                        if (Enum.TryParse<Genre>(genreStr.Trim(), true, out var genre))
                        {
                            mud.MudGenres.Add(new MudGenre { MudId = mud.Id, Genre = genre });
                        }
                    }
                }

                await _mudRepository.CreateAsync(mud, cancellationToken);
                successCount++;
            }
            catch (Exception ex)
            {
                errors.Add(new ImportErrorDto(rowNumber, "General", $"Failed to create MUD: {ex.Message}"));
            }
        }

        // Create audit log
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = "BulkImport",
            UserId = request.ImporterUserId,
            TargetType = "Mud",
            Details = $"Imported {successCount} MUDs. {errors.Count} errors.",
            CreatedAt = DateTime.UtcNow
        };

        await _adminRepository.CreateAuditLogAsync(auditLog, cancellationToken);

        return new ImportResultDto(
            request.Rows.Count,
            successCount,
            errors.Count,
            errors
        );
    }
}
