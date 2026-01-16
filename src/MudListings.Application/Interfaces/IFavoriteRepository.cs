using MudListings.Application.DTOs.Favorites;
using MudListings.Domain.Entities;

namespace MudListings.Application.Interfaces;

/// <summary>
/// Repository interface for favorite operations.
/// </summary>
public interface IFavoriteRepository
{
    // Read operations
    Task<FavoriteListDto> GetByUserIdAsync(Guid userId, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<bool> IsFavoritedAsync(Guid userId, Guid mudId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Guid>> GetFavoritedMudIdsAsync(Guid userId, CancellationToken cancellationToken = default);

    // Write operations
    Task AddAsync(Favorite favorite, CancellationToken cancellationToken = default);
    Task RemoveAsync(Guid userId, Guid mudId, CancellationToken cancellationToken = default);

    // Counts
    Task<int> GetFavoriteCountForMudAsync(Guid mudId, CancellationToken cancellationToken = default);
    Task<int> GetFavoriteCountForUserAsync(Guid userId, CancellationToken cancellationToken = default);
}
