using MediatR;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;
using MudListings.Domain.Enums;
using MudListings.Domain.ValueObjects;

namespace MudListings.Application.MudAdmin.Commands;

/// <summary>
/// Command to update a MUD's information (admin only).
/// </summary>
public record UpdateMudCommand(
    Guid MudId,
    Guid AdminUserId,
    string Name,
    string Description,
    string? ShortDescription,
    string Host,
    int Port,
    string? WebClientUrl,
    string? Website,
    string? DiscordUrl,
    string? WikiUrl,
    string? Codebase,
    string? Language,
    DateTime? EstablishedDate,
    IList<string> Genres
) : IRequest<MudDetailDto?>;

public class UpdateMudCommandHandler : IRequestHandler<UpdateMudCommand, MudDetailDto?>
{
    private readonly IMudRepository _mudRepository;
    private readonly IMudAdminRepository _mudAdminRepository;

    public UpdateMudCommandHandler(IMudRepository mudRepository, IMudAdminRepository mudAdminRepository)
    {
        _mudRepository = mudRepository;
        _mudAdminRepository = mudAdminRepository;
    }

    public async Task<MudDetailDto?> Handle(UpdateMudCommand request, CancellationToken cancellationToken)
    {
        // Verify user is admin of this MUD
        var isAdmin = await _mudAdminRepository.IsUserAdminOfMudAsync(request.AdminUserId, request.MudId, cancellationToken);
        if (!isAdmin) return null;

        var mud = await _mudRepository.GetByIdAsync(request.MudId, cancellationToken);
        if (mud == null) return null;

        // Update basic info
        mud.Name = request.Name;
        mud.Description = request.Description;
        mud.ShortDescription = request.ShortDescription;
        mud.Website = request.Website;
        mud.DiscordUrl = request.DiscordUrl;
        mud.WikiUrl = request.WikiUrl;
        mud.Codebase = request.Codebase;
        mud.Language = request.Language;
        mud.EstablishedDate = request.EstablishedDate;
        mud.UpdatedAt = DateTime.UtcNow;

        // Update connection info
        mud.Connection = new ConnectionInfo
        {
            Host = request.Host,
            Port = request.Port,
            WebClientUrl = request.WebClientUrl
        };

        // Update slug if name changed
        var newSlug = Mud.GenerateSlug(request.Name);
        if (mud.Slug != newSlug)
        {
            // Check if new slug is available
            var slugExists = await _mudRepository.SlugExistsAsync(newSlug, request.MudId, cancellationToken);
            if (!slugExists)
            {
                mud.Slug = newSlug;
            }
        }

        // Update genres
        mud.MudGenres.Clear();
        foreach (var genreStr in request.Genres)
        {
            if (Enum.TryParse<Genre>(genreStr, true, out var genre))
            {
                mud.MudGenres.Add(new MudGenre { MudId = mud.Id, Genre = genre });
            }
        }

        await _mudRepository.UpdateAsync(mud, cancellationToken);

        return await _mudRepository.GetDetailByIdAsync(request.MudId, request.AdminUserId, cancellationToken);
    }
}
