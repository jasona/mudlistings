using MediatR;
using MudListings.Application.DTOs.Favorites;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Favorites.Queries;

/// <summary>
/// Query to get a user's favorite MUDs.
/// </summary>
public record GetUserFavoritesQuery(
    Guid UserId,
    int Page = 1,
    int PageSize = 20
) : IRequest<FavoriteListDto>;

public class GetUserFavoritesQueryHandler : IRequestHandler<GetUserFavoritesQuery, FavoriteListDto>
{
    private readonly IFavoriteRepository _favoriteRepository;

    public GetUserFavoritesQueryHandler(IFavoriteRepository favoriteRepository)
    {
        _favoriteRepository = favoriteRepository;
    }

    public async Task<FavoriteListDto> Handle(GetUserFavoritesQuery request, CancellationToken cancellationToken)
    {
        return await _favoriteRepository.GetByUserIdAsync(
            request.UserId,
            request.Page,
            request.PageSize,
            cancellationToken);
    }
}
