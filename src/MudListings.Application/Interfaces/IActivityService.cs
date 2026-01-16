using MudListings.Domain.Enums;

namespace MudListings.Application.Interfaces;

/// <summary>
/// Service interface for activity event operations.
/// </summary>
public interface IActivityService
{
    /// <summary>
    /// Creates a new activity event.
    /// </summary>
    Task CreateEventAsync(
        ActivityEventType type,
        Guid? userId,
        Guid? mudId,
        string description,
        object? metadata = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates an event for a new MUD listing.
    /// </summary>
    Task CreateNewListingEventAsync(Guid mudId, string mudName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates an event for a new review.
    /// </summary>
    Task CreateNewReviewEventAsync(Guid userId, Guid mudId, string mudName, int rating, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates an event for a status change.
    /// </summary>
    Task CreateStatusChangeEventAsync(Guid mudId, string mudName, bool isOnline, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates an event for a MUD being featured.
    /// </summary>
    Task CreateFeaturedEventAsync(Guid mudId, string mudName, CancellationToken cancellationToken = default);
}
