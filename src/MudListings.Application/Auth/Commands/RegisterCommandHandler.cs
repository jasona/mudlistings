using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using MudListings.Application.Common.Settings;
using MudListings.Application.DTOs.Auth;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;
using MudListings.Domain.Enums;

namespace MudListings.Application.Auth.Commands;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResult<AuthResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly JwtSettings _jwtSettings;

    public RegisterCommandHandler(
        UserManager<User> userManager,
        ITokenService tokenService,
        IEmailService emailService,
        IOptions<JwtSettings> jwtSettings)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _emailService = emailService;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<AuthResult<AuthResponse>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // Check if user already exists
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return new AuthResult<AuthResponse>(false, null, "A user with this email already exists.");
        }

        // Create new user
        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.DisplayName,
            Role = UserRole.Player,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return new AuthResult<AuthResponse>(
                false,
                null,
                "Registration failed.",
                result.Errors.Select(e => e.Description));
        }

        // Generate email verification token
        var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);

        // Send verification email
        // Note: In a real app, you'd construct the full URL with frontend route
        var verificationLink = $"/verify-email?userId={user.Id}&token={Uri.EscapeDataString(emailToken)}";
        await _emailService.SendEmailVerificationAsync(user.Email!, user.DisplayName, verificationLink);

        // Generate tokens (user won't be able to do much until email is verified)
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

        return new AuthResult<AuthResponse>(true, response, "Registration successful. Please verify your email.");
    }
}
