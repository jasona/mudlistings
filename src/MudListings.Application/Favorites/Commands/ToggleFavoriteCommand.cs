using MediatR;
using MudListings.Application.DTOs.Favorites;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Application.Favorites.Commands;

/// <summary>
/// Command to toggle a MUD as favorite.
/// </summary>
public record ToggleFavoriteCommand(
    Guid MudId,
    Guid UserId
) : IRequest<ToggleFavoriteResult?>;

public class ToggleFavoriteCommandHandler : IRequestHandler<ToggleFavoriteCommand, ToggleFavoriteResult?>
{
    private readonly IFavoriteRepository _favoriteRepository;
    private readonly IMudRepository _mudRepository;

    public ToggleFavoriteCommandHandler(IFavoriteRepository favoriteRepository, IMudRepository mudRepository)
    {
        _favoriteRepository = favoriteRepository;
        _mudRepository = mudRepository;
    }

    public async Task<ToggleFavoriteResult?> Handle(ToggleFavoriteCommand request, CancellationToken cancellationToken)
    {
        // Verify MUD exists
        var mudExists = await _mudRepository.ExistsAsync(request.MudId, cancellationToken);
        if (!mudExists) return null;

        var isFavorited = await _favoriteRepository.IsFavoritedAsync(request.UserId, request.MudId, cancellationToken);

        if (isFavorited)
        {
            await _favoriteRepository.RemoveAsync(request.UserId, request.MudId, cancellationToken);
        }
        else
        {
            var favorite = new Favorite
            {
                UserId = request.UserId,
                MudId = request.MudId,
                CreatedAt = DateTime.UtcNow
            };
            await _favoriteRepository.AddAsync(favorite, cancellationToken);
        }

        // Get updated count
        var newCount = await _favoriteRepository.GetFavoriteCountForMudAsync(request.MudId, cancellationToken);

        // Update MUD's favorite count
        await UpdateMudFavoriteCount(request.MudId, newCount, cancellationToken);

        return new ToggleFavoriteResult(
            IsFavorited: !isFavorited,
            NewFavoriteCount: newCount
        );
    }

    private async Task UpdateMudFavoriteCount(Guid mudId, int count, CancellationToken cancellationToken)
    {
        var mud = await _mudRepository.GetByIdAsync(mudId, cancellationToken);
        if (mud != null)
        {
            mud.FavoriteCount = count;
            await _mudRepository.UpdateAsync(mud, cancellationToken);
        }
    }
}
