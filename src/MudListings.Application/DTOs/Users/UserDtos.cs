namespace MudListings.Application.DTOs.Users;

/// <summary>
/// Full user profile for the current authenticated user.
/// </summary>
public record UserProfileDto(
    Guid Id,
    string Email,
    string DisplayName,
    string? AvatarUrl,
    string? Bio,
    string Role,
    bool IsProfilePublic,
    bool ShowFavoritesPublicly,
    bool EmailConfirmed,
    DateTime CreatedAt,
    DateTime? LastLoginAt
);

/// <summary>
/// Public user profile visible to other users.
/// </summary>
public record PublicUserProfileDto(
    Guid Id,
    string DisplayName,
    string? AvatarUrl,
    string? Bio,
    DateTime CreatedAt,
    int ReviewCount,
    int FavoriteCount
);

/// <summary>
/// Request to update user profile.
/// </summary>
public record UpdateProfileRequest(
    string? DisplayName,
    string? Bio,
    string? AvatarUrl,
    bool? IsProfilePublic,
    bool? ShowFavoritesPublicly
);

/// <summary>
/// Request to change password.
/// </summary>
public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);
