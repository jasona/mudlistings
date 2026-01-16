using MudListings.Domain.Common;

namespace MudListings.Domain.Entities;

/// <summary>
/// User review of a MUD with rating.
/// </summary>
public class Review : SoftDeleteEntity
{
    public Guid MudId { get; set; }
    public Mud Mud { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    /// <summary>
    /// Rating from 1-5 stars.
    /// </summary>
    public int Rating { get; set; }

    public string? Title { get; set; }
    public string Body { get; set; } = string.Empty;

    public int HelpfulCount { get; set; }

    /// <summary>
    /// Hidden reviews are not shown to users but are not deleted.
    /// </summary>
    public bool IsHidden { get; set; }

    // Navigation properties
    public ICollection<ReviewHelpful> HelpfulVotes { get; set; } = new List<ReviewHelpful>();
    public ReviewReply? AdminReply { get; set; }
    public ICollection<ReviewReport> Reports { get; set; } = new List<ReviewReport>();

    /// <summary>
    /// Validates that the rating is within acceptable range.
    /// </summary>
    public bool IsValidRating() => Rating >= 1 && Rating <= 5;
}
