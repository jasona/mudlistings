using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using MudListings.Application.Common.Settings;
using MudListings.Application.DTOs.Auth;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Application.Auth.Commands;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResult<AuthResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly ITokenService _tokenService;
    private readonly JwtSettings _jwtSettings;

    public LoginCommandHandler(
        UserManager<User> userManager,
        ITokenService tokenService,
        IOptions<JwtSettings> jwtSettings)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<AuthResult<AuthResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return new AuthResult<AuthResponse>(false, null, "Invalid email or password.");
        }

        // Check if account is locked out
        if (await _userManager.IsLockedOutAsync(user))
        {
            return new AuthResult<AuthResponse>(false, null, "Account is locked. Please try again later.");
        }

        // Check if email is confirmed
        if (!user.EmailConfirmed)
        {
            return new AuthResult<AuthResponse>(false, null, "Please verify your email before logging in.");
        }

        // Validate password
        var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid)
        {
            // Record failed access attempt
            await _userManager.AccessFailedAsync(user);

            if (await _userManager.IsLockedOutAsync(user))
            {
                return new AuthResult<AuthResponse>(false, null, "Account has been locked due to multiple failed attempts.");
            }

            return new AuthResult<AuthResponse>(false, null, "Invalid email or password.");
        }

        // Reset access failed count on successful login
        await _userManager.ResetAccessFailedCountAsync(user);

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
}
