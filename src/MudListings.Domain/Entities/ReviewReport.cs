using MudListings.Domain.Common;

namespace MudListings.Domain.Entities;

/// <summary>
/// Report of a review for moderation.
/// </summary>
public class ReviewReport : BaseEntity
{
    public Guid ReviewId { get; set; }
    public Review Review { get; set; } = null!;

    public Guid ReporterId { get; set; }
    public User Reporter { get; set; } = null!;

    public string Reason { get; set; } = string.Empty;
    public string? Details { get; set; }

    public ReviewReportStatus Status { get; set; } = ReviewReportStatus.Pending;
    public DateTime? ResolvedAt { get; set; }
    public Guid? ResolvedByUserId { get; set; }
    public User? ResolvedByUser { get; set; }
    public string? Resolution { get; set; }
}

public enum ReviewReportStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    ReviewHidden = 3,
    ReviewDeleted = 4
}
