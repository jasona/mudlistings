using MudListings.Domain.Entities;

namespace MudListings.Application.DTOs.Admin;

/// <summary>
/// Reported review for moderation queue.
/// </summary>
public record ReportedReviewDto(
    Guid ReportId,
    Guid ReviewId,
    string ReviewTitle,
    string ReviewBody,
    int ReviewRating,
    string ReviewerDisplayName,
    Guid ReviewerId,
    string MudName,
    Guid MudId,
    string ReporterDisplayName,
    Guid ReporterId,
    string Reason,
    string? Details,
    ReviewReportStatus Status,
    DateTime ReportedAt
);

/// <summary>
/// Moderation queue response with pagination.
/// </summary>
public record ModerationQueueDto(
    IReadOnlyList<ReportedReviewDto> Items,
    int TotalCount,
    int Page,
    int PageSize
);

/// <summary>
/// Request to moderate content.
/// </summary>
public record ModerateContentRequest(
    ModerationAction Action,
    string? Resolution
);

/// <summary>
/// Moderation actions available.
/// </summary>
public enum ModerationAction
{
    Approve,    // Report is invalid, review stays
    HideReview, // Hide the review from public
    DeleteReview // Delete the review entirely
}

/// <summary>
/// Audit log entry DTO.
/// </summary>
public record AuditLogDto(
    Guid Id,
    string Action,
    string EntityType,
    Guid? EntityId,
    string? EntityName,
    Guid UserId,
    string UserDisplayName,
    string? Details,
    DateTime Timestamp
);

/// <summary>
/// Audit log list with pagination.
/// </summary>
public record AuditLogListDto(
    IReadOnlyList<AuditLogDto> Items,
    int TotalCount,
    int Page,
    int PageSize
);

/// <summary>
/// Site statistics for admin dashboard.
/// </summary>
public record SiteStatsDto(
    int TotalMuds,
    int OnlineMuds,
    int TotalUsers,
    int TotalReviews,
    int PendingReports,
    int NewMudsLast7Days,
    int NewUsersLast7Days,
    int NewReviewsLast7Days
);

/// <summary>
/// User for admin management.
/// </summary>
public record AdminUserDto(
    Guid Id,
    string Email,
    string DisplayName,
    string? AvatarUrl,
    bool EmailConfirmed,
    IReadOnlyList<string> Roles,
    DateTime CreatedAt,
    DateTime? LastLoginAt,
    bool IsLockedOut
);

/// <summary>
/// User list with pagination.
/// </summary>
public record AdminUserListDto(
    IReadOnlyList<AdminUserDto> Items,
    int TotalCount,
    int Page,
    int PageSize
);

/// <summary>
/// Request to change user role.
/// </summary>
public record ChangeUserRoleRequest(
    string Role
);

/// <summary>
/// Request to create a MUD manually.
/// </summary>
public record CreateMudRequest(
    string Name,
    string Description,
    string? ShortDescription,
    string Host,
    int Port,
    string? WebClientUrl,
    string? Website,
    string? DiscordUrl,
    string? WikiUrl,
    string? Codebase,
    string? Language,
    DateTime? EstablishedDate,
    IList<string> Genres
);

/// <summary>
/// Bulk import result.
/// </summary>
public record ImportResultDto(
    int TotalRows,
    int SuccessCount,
    int ErrorCount,
    IReadOnlyList<ImportErrorDto> Errors
);

/// <summary>
/// Import error detail.
/// </summary>
public record ImportErrorDto(
    int RowNumber,
    string Field,
    string Message
);

/// <summary>
/// Featured MUD for ordering.
/// </summary>
public record FeaturedMudDto(
    Guid MudId,
    string MudName,
    string MudSlug,
    int FeaturedOrder,
    DateTime FeaturedAt
);

/// <summary>
/// Request to set featured order.
/// </summary>
public record SetFeaturedOrderRequest(
    IList<Guid> MudIds
);
