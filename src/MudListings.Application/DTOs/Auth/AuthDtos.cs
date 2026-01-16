namespace MudListings.Application.DTOs.Auth;

/// <summary>
/// Request to register a new user.
/// </summary>
public record RegisterRequest(
    string Email,
    string Password,
    string DisplayName
);

/// <summary>
/// Request to log in.
/// </summary>
public record LoginRequest(
    string Email,
    string Password
);

/// <summary>
/// Request to refresh an access token.
/// </summary>
public record RefreshTokenRequest(
    string RefreshToken
);

/// <summary>
/// Request to verify email.
/// </summary>
public record VerifyEmailRequest(
    string UserId,
    string Token
);

/// <summary>
/// Request to initiate password reset.
/// </summary>
public record ForgotPasswordRequest(
    string Email
);

/// <summary>
/// Request to reset password with token.
/// </summary>
public record ResetPasswordRequest(
    string Email,
    string Token,
    string NewPassword
);

/// <summary>
/// Request for external OAuth login.
/// </summary>
public record ExternalLoginRequest(
    string Provider,
    string IdToken
);

/// <summary>
/// Response containing authentication tokens.
/// </summary>
public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User
);

/// <summary>
/// Basic user information.
/// </summary>
public record UserDto(
    Guid Id,
    string Email,
    string DisplayName,
    string? AvatarUrl,
    string Role,
    bool EmailConfirmed
);

/// <summary>
/// Generic result wrapper for auth operations.
/// </summary>
public record AuthResult(
    bool Succeeded,
    string? Message = null,
    IEnumerable<string>? Errors = null
);

/// <summary>
/// Auth result with data.
/// </summary>
public record AuthResult<T>(
    bool Succeeded,
    T? Data = default,
    string? Message = null,
    IEnumerable<string>? Errors = null
);
