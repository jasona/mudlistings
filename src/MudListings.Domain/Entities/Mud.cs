using MudListings.Domain.Common;
using MudListings.Domain.Enums;
using MudListings.Domain.ValueObjects;

namespace MudListings.Domain.Entities;

/// <summary>
/// Represents a MUD (Multi-User Dungeon) game listing.
/// </summary>
public class Mud : SoftDeleteEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }

    // Connection details (owned type)
    public ConnectionInfo Connection { get; set; } = new();

    // Website and external links
    public string? Website { get; set; }
    public string? DiscordUrl { get; set; }
    public string? WikiUrl { get; set; }

    // MUD details
    public string? Codebase { get; set; }
    public string? Language { get; set; }
    public DateTime? EstablishedDate { get; set; }

    // Status tracking
    public bool IsOnline { get; set; }
    public DateTime? LastOnlineCheck { get; set; }
    public int ConsecutiveFailures { get; set; }

    // Current MSSP data (owned type)
    public MsspData? CurrentMsspData { get; set; }

    // Aggregate rating (owned type)
    public Rating AggregateRating { get; set; } = new(0, 0);

    // Featured/trending
    public bool IsFeatured { get; set; }
    public int? FeaturedOrder { get; set; }
    public double TrendingScore { get; set; }

    // Stats
    public int ViewCount { get; set; }
    public int FavoriteCount { get; set; }

    // Navigation properties
    public ICollection<MudGenre> MudGenres { get; set; } = new List<MudGenre>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<MudAdmin> Admins { get; set; } = new List<MudAdmin>();
    public ICollection<MudStatus> StatusHistory { get; set; } = new List<MudStatus>();
    public ICollection<ActivityEvent> ActivityEvents { get; set; } = new List<ActivityEvent>();

    /// <summary>
    /// Generates a URL-friendly slug from the name.
    /// </summary>
    public static string GenerateSlug(string name)
    {
        return name
            .ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("'", "")
            .Replace("\"", "")
            .Replace("&", "and");
    }

    /// <summary>
    /// Marks the MUD as offline after consecutive failures.
    /// </summary>
    public void MarkOffline()
    {
        IsOnline = false;
        LastOnlineCheck = DateTime.UtcNow;
    }

    /// <summary>
    /// Updates status from successful MSSP poll.
    /// </summary>
    public void UpdateFromMssp(MsspData msspData)
    {
        IsOnline = true;
        LastOnlineCheck = DateTime.UtcNow;
        ConsecutiveFailures = 0;
        CurrentMsspData = msspData;
    }

    /// <summary>
    /// Records a failed connection attempt.
    /// </summary>
    public void RecordFailure()
    {
        ConsecutiveFailures++;
        LastOnlineCheck = DateTime.UtcNow;

        // Mark offline after 3 consecutive failures
        if (ConsecutiveFailures >= 3)
        {
            MarkOffline();
        }
    }
}
