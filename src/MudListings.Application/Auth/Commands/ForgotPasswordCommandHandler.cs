using MediatR;
using Microsoft.AspNetCore.Identity;
using MudListings.Application.DTOs.Auth;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Application.Auth.Commands;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, AuthResult>
{
    private readonly UserManager<User> _userManager;
    private readonly IEmailService _emailService;

    public ForgotPasswordCommandHandler(
        UserManager<User> userManager,
        IEmailService emailService)
    {
        _userManager = userManager;
        _emailService = emailService;
    }

    public async Task<AuthResult> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        // Always return success to prevent email enumeration
        if (user == null || !user.EmailConfirmed)
        {
            return new AuthResult(true, "If an account with that email exists, a password reset link has been sent.");
        }

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

        // Note: In a real app, you'd construct the full URL with frontend route
        var resetLink = $"/reset-password?email={Uri.EscapeDataString(user.Email!)}&token={Uri.EscapeDataString(resetToken)}";

        await _emailService.SendPasswordResetAsync(user.Email!, user.DisplayName, resetLink);

        return new AuthResult(true, "If an account with that email exists, a password reset link has been sent.");
    }
}
