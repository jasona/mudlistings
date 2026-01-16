using MediatR;
using MudListings.Application.DTOs.Admin;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;
using MudListings.Domain.Enums;
using MudListings.Domain.ValueObjects;

namespace MudListings.Application.Admin.Commands;

/// <summary>
/// Command to manually create a MUD (admin only).
/// </summary>
public record CreateMudCommand(
    CreateMudRequest Request,
    Guid AdminUserId
) : IRequest<CreateMudResult>;

public record CreateMudResult(
    bool Success,
    string Message,
    Guid? MudId = null
);

public class CreateMudCommandHandler : IRequestHandler<CreateMudCommand, CreateMudResult>
{
    private readonly IMudRepository _mudRepository;
    private readonly IAdminRepository _adminRepository;

    public CreateMudCommandHandler(
        IMudRepository mudRepository,
        IAdminRepository adminRepository)
    {
        _mudRepository = mudRepository;
        _adminRepository = adminRepository;
    }

    public async Task<CreateMudResult> Handle(CreateMudCommand request, CancellationToken cancellationToken)
    {
        var req = request.Request;

        // Validate required fields
        if (string.IsNullOrWhiteSpace(req.Name))
        {
            return new CreateMudResult(false, "Name is required.");
        }

        if (string.IsNullOrWhiteSpace(req.Description))
        {
            return new CreateMudResult(false, "Description is required.");
        }

        if (string.IsNullOrWhiteSpace(req.Host))
        {
            return new CreateMudResult(false, "Host is required.");
        }

        if (req.Port <= 0 || req.Port > 65535)
        {
            return new CreateMudResult(false, "Port must be between 1 and 65535.");
        }

        // Generate slug
        var slug = Mud.GenerateSlug(req.Name);
        if (await _mudRepository.SlugExistsAsync(slug, null, cancellationToken))
        {
            slug = $"{slug}-{Guid.NewGuid().ToString()[..8]}";
        }

        var mud = new Mud
        {
            Id = Guid.NewGuid(),
            Name = req.Name.Trim(),
            Slug = slug,
            Description = req.Description.Trim(),
            ShortDescription = req.ShortDescription?.Trim(),
            Connection = new ConnectionInfo
            {
                Host = req.Host.Trim(),
                Port = req.Port,
                WebClientUrl = req.WebClientUrl?.Trim()
            },
            Website = req.Website?.Trim(),
            DiscordUrl = req.DiscordUrl?.Trim(),
            WikiUrl = req.WikiUrl?.Trim(),
            Codebase = req.Codebase?.Trim(),
            Language = req.Language?.Trim(),
            EstablishedDate = req.EstablishedDate,
            CreatedAt = DateTime.UtcNow
        };

        // Parse genres
        foreach (var genreStr in req.Genres)
        {
            if (Enum.TryParse<Genre>(genreStr.Trim(), true, out var genre))
            {
                mud.MudGenres.Add(new MudGenre { MudId = mud.Id, Genre = genre });
            }
        }

        await _mudRepository.CreateAsync(mud, cancellationToken);

        // Create audit log
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = "CreateMud",
            UserId = request.AdminUserId,
            TargetType = "Mud",
            TargetId = mud.Id,
            Details = $"Manually created MUD: {mud.Name}",
            CreatedAt = DateTime.UtcNow
        };

        await _adminRepository.CreateAuditLogAsync(auditLog, cancellationToken);

        return new CreateMudResult(true, $"MUD '{mud.Name}' created successfully.", mud.Id);
    }
}
