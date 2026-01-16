using MediatR;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Favorites.Queries;

/// <summary>
/// Query to check if a MUD is favorited by a user.
/// </summary>
public record CheckIsFavoriteQuery(
    Guid UserId,
    Guid MudId
) : IRequest<bool>;

public class CheckIsFavoriteQueryHandler : IRequestHandler<CheckIsFavoriteQuery, bool>
{
    private readonly IFavoriteRepository _favoriteRepository;

    public CheckIsFavoriteQueryHandler(IFavoriteRepository favoriteRepository)
    {
        _favoriteRepository = favoriteRepository;
    }

    public async Task<bool> Handle(CheckIsFavoriteQuery request, CancellationToken cancellationToken)
    {
        return await _favoriteRepository.IsFavoritedAsync(
            request.UserId,
            request.MudId,
            cancellationToken);
    }
}
