namespace MudListings.Application.DTOs.Reviews;

/// <summary>
/// Review DTO for list views.
/// </summary>
public record ReviewDto(
    Guid Id,
    Guid MudId,
    string MudName,
    string MudSlug,
    ReviewUserDto User,
    int Rating,
    string? Title,
    string Body,
    int HelpfulCount,
    bool HasVotedHelpful,
    ReviewReplyDto? AdminReply,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

/// <summary>
/// User info for review display.
/// </summary>
public record ReviewUserDto(
    Guid Id,
    string DisplayName,
    string? AvatarUrl
);

/// <summary>
/// Admin reply DTO.
/// </summary>
public record ReviewReplyDto(
    Guid Id,
    ReviewUserDto AdminUser,
    string Body,
    DateTime CreatedAt
);

/// <summary>
/// Request to create a review.
/// </summary>
public record CreateReviewRequest(
    int Rating,
    string? Title,
    string Body
);

/// <summary>
/// Request to update a review.
/// </summary>
public record UpdateReviewRequest(
    int Rating,
    string? Title,
    string Body
);

/// <summary>
/// Request to reply to a review.
/// </summary>
public record ReplyToReviewRequest(
    string Body
);

/// <summary>
/// Request to report a review.
/// </summary>
public record ReportReviewRequest(
    string Reason,
    string? Details
);

/// <summary>
/// Paginated review list response.
/// </summary>
public record ReviewListDto(
    IReadOnlyList<ReviewDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages,
    double? AverageRating,
    RatingDistributionDto? RatingDistribution
);

/// <summary>
/// Rating distribution for a MUD.
/// </summary>
public record RatingDistributionDto(
    int OneStar,
    int TwoStar,
    int ThreeStar,
    int FourStar,
    int FiveStar
);

/// <summary>
/// Sort options for reviews.
/// </summary>
public enum ReviewSortBy
{
    Newest,
    Oldest,
    HighestRating,
    LowestRating,
    MostHelpful
}
