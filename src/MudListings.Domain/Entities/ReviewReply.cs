using MudListings.Domain.Common;

namespace MudListings.Domain.Entities;

/// <summary>
/// Admin reply to a review.
/// </summary>
public class ReviewReply : BaseEntity
{
    public Guid ReviewId { get; set; }
    public Review Review { get; set; } = null!;

    public Guid AdminUserId { get; set; }
    public User AdminUser { get; set; } = null!;

    public string Body { get; set; } = string.Empty;
}
