using MudListings.Domain.Entities;

namespace MudListings.Application.Interfaces;

/// <summary>
/// Service for generating and validating JWT tokens.
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Generates an access token for the specified user.
    /// </summary>
    string GenerateAccessToken(User user);

    /// <summary>
    /// Generates a refresh token.
    /// </summary>
    string GenerateRefreshToken();

    /// <summary>
    /// Validates a refresh token and returns the associated user ID if valid.
    /// </summary>
    Task<Guid?> ValidateRefreshTokenAsync(string refreshToken);

    /// <summary>
    /// Stores a refresh token for a user.
    /// </summary>
    Task StoreRefreshTokenAsync(Guid userId, string refreshToken, DateTime expiresAt);

    /// <summary>
    /// Revokes all refresh tokens for a user.
    /// </summary>
    Task RevokeRefreshTokensAsync(Guid userId);
}
