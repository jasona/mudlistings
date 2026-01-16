using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using MudListings.Application.Common.Settings;
using MudListings.Application.DTOs.Auth;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;
using MudListings.Domain.Enums;

namespace MudListings.Application.Auth.Commands;

public class ExternalLoginCommandHandler : IRequestHandler<ExternalLoginCommand, AuthResult<AuthResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly ITokenService _tokenService;
    private readonly JwtSettings _jwtSettings;

    public ExternalLoginCommandHandler(
        UserManager<User> userManager,
        ITokenService tokenService,
        IOptions<JwtSettings> jwtSettings)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<AuthResult<AuthResponse>> Handle(ExternalLoginCommand request, CancellationToken cancellationToken)
    {
        // Validate the external provider token and extract claims
        var externalUser = await ValidateExternalTokenAsync(request.Provider, request.IdToken);
        if (externalUser == null)
        {
            return new AuthResult<AuthResponse>(false, null, "Invalid external login token.");
        }

        // Try to find user by external login
        var user = await _userManager.FindByLoginAsync(request.Provider, externalUser.ProviderId);

        if (user == null)
        {
            // Try to find by email
            user = await _userManager.FindByEmailAsync(externalUser.Email);

            if (user == null)
            {
                // Create new user
                user = new User
                {
                    UserName = externalUser.Email,
                    Email = externalUser.Email,
                    DisplayName = externalUser.Name ?? externalUser.Email.Split('@')[0],
                    EmailConfirmed = true, // External providers verify email
                    Role = UserRole.Player,
                    AvatarUrl = externalUser.AvatarUrl,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    return new AuthResult<AuthResponse>(
                        false,
                        null,
                        "Failed to create user account.",
                        createResult.Errors.Select(e => e.Description));
                }
            }

            // Link external login to user
            var loginInfo = new UserLoginInfo(request.Provider, externalUser.ProviderId, request.Provider);
            var addLoginResult = await _userManager.AddLoginAsync(user, loginInfo);
            if (!addLoginResult.Succeeded)
            {
                return new AuthResult<AuthResponse>(
                    false,
                    null,
                    "Failed to link external login.",
                    addLoginResult.Errors.Select(e => e.Description));
            }
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        // Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);

        await _tokenService.StoreRefreshTokenAsync(
            user.Id,
            refreshToken,
            DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays));

        var userDto = new UserDto(
            user.Id,
            user.Email!,
            user.DisplayName,
            user.AvatarUrl,
            user.Role.ToString(),
            user.EmailConfirmed);

        var response = new AuthResponse(accessToken, refreshToken, expiresAt, userDto);

        return new AuthResult<AuthResponse>(true, response);
    }

    private async Task<ExternalUserInfo?> ValidateExternalTokenAsync(string provider, string idToken)
    {
        // In a real implementation, you would:
        // 1. For Google: Use Google.Apis.Auth to validate the ID token
        // 2. For Discord: Call Discord's API to validate the token
        // This is a placeholder that would need actual implementation

        return provider.ToLower() switch
        {
            "google" => await ValidateGoogleTokenAsync(idToken),
            "discord" => await ValidateDiscordTokenAsync(idToken),
            _ => null
        };
    }

    private Task<ExternalUserInfo?> ValidateGoogleTokenAsync(string idToken)
    {
        // TODO: Implement Google token validation
        // Use Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync(idToken)
        return Task.FromResult<ExternalUserInfo?>(null);
    }

    private Task<ExternalUserInfo?> ValidateDiscordTokenAsync(string idToken)
    {
        // TODO: Implement Discord token validation
        // Call Discord API to validate and get user info
        return Task.FromResult<ExternalUserInfo?>(null);
    }

    private record ExternalUserInfo(
        string ProviderId,
        string Email,
        string? Name,
        string? AvatarUrl
    );
}
