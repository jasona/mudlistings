using MudListings.Application.DTOs.Users;

namespace MudListings.Application.Interfaces;

public interface IUserProfileRepository
{
    Task<PublicUserProfileDto?> GetPublicProfileAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<int> GetReviewCountAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<int> GetFavoriteCountAsync(Guid userId, CancellationToken cancellationToken = default);
}
