namespace MudListings.Domain.Enums;

/// <summary>
/// Types of activity events for the activity feed.
/// </summary>
public enum ActivityEventType
{
    NewListing = 1,
    NewReview = 2,
    StatusChange = 3,
    Featured = 4
}
