using MudListings.Domain.Common;
using MudListings.Domain.Enums;

namespace MudListings.Domain.Entities;

/// <summary>
/// Activity event for the activity feed.
/// </summary>
public class ActivityEvent : BaseEntity
{
    public ActivityEventType Type { get; set; }

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public Guid? MudId { get; set; }
    public Mud? Mud { get; set; }

    /// <summary>
    /// JSON metadata for flexible event details.
    /// </summary>
    public string? MetadataJson { get; set; }

    /// <summary>
    /// Human-readable description of the event.
    /// </summary>
    public string Description { get; set; } = string.Empty;
}
