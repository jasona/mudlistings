using MudListings.Application.DTOs.Activity;

namespace MudListings.Application.Interfaces;

/// <summary>
/// Repository interface for activity feed operations.
/// </summary>
public interface IActivityRepository
{
    /// <summary>
    /// Gets the global activity feed.
    /// </summary>
    Task<ActivityFeedDto> GetGlobalFeedAsync(int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a personalized activity feed based on user's favorited MUDs.
    /// </summary>
    Task<ActivityFeedDto> GetPersonalizedFeedAsync(Guid userId, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets activity events for a specific MUD.
    /// </summary>
    Task<ActivityFeedDto> GetMudActivityAsync(Guid mudId, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
}
