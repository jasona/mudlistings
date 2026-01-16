using MudListings.Domain.Entities;

namespace MudListings.Application.DTOs.MudAdmin;

/// <summary>
/// MUD admin DTO for display.
/// </summary>
public record MudAdminDto(
    Guid Id,
    Guid UserId,
    string UserDisplayName,
    string? UserAvatarUrl,
    bool IsOwner,
    bool IsVerified,
    MudAdminVerificationMethod? VerificationMethod,
    DateTime? VerifiedAt,
    DateTime CreatedAt
);

/// <summary>
/// MUD managed by admin for list views.
/// </summary>
public record ManagedMudDto(
    Guid MudId,
    string MudName,
    string MudSlug,
    bool IsOwner,
    bool IsVerified,
    bool IsOnline,
    int? PlayerCount,
    double RatingAverage,
    int RatingCount,
    int ViewCount,
    int FavoriteCount
);

/// <summary>
/// Claim initiation request.
/// </summary>
public record InitiateClaimRequest(
    MudAdminVerificationMethod VerificationMethod
);

/// <summary>
/// Claim initiation response.
/// </summary>
public record ClaimInitiationDto(
    Guid ClaimId,
    string VerificationCode,
    MudAdminVerificationMethod VerificationMethod,
    string Instructions
);

/// <summary>
/// Verification request.
/// </summary>
public record VerifyClaimRequest(
    Guid ClaimId
);

/// <summary>
/// MUD update request from admin.
/// </summary>
public record UpdateMudRequest(
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
/// Admin invite request.
/// </summary>
public record InviteAdminRequest(
    string Email
);

/// <summary>
/// Ownership transfer request.
/// </summary>
public record TransferOwnershipRequest(
    Guid NewOwnerUserId
);

/// <summary>
/// Analytics data for a MUD.
/// </summary>
public record MudAnalyticsDto(
    Guid MudId,
    string MudName,
    int TotalViews,
    int ViewsLast7Days,
    int ViewsLast30Days,
    int TotalFavorites,
    int FavoritesLast7Days,
    int FavoritesLast30Days,
    int TotalReviews,
    int ReviewsLast7Days,
    int ReviewsLast30Days,
    double AverageRating,
    double? UptimePercentage,
    int? AveragePlayerCount,
    int? PeakPlayerCount
);
