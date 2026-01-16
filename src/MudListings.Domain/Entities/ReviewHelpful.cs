namespace MudListings.Domain.Entities;

/// <summary>
/// Represents a user's "helpful" vote on a review.
/// </summary>
public class ReviewHelpful
{
    public Guid ReviewId { get; set; }
    public Review Review { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
