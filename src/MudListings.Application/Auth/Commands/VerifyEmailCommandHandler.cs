using MediatR;
using Microsoft.AspNetCore.Identity;
using MudListings.Application.DTOs.Auth;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Application.Auth.Commands;

public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, AuthResult>
{
    private readonly UserManager<User> _userManager;
    private readonly IEmailService _emailService;

    public VerifyEmailCommandHandler(
        UserManager<User> userManager,
        IEmailService emailService)
    {
        _userManager = userManager;
        _emailService = emailService;
    }

    public async Task<AuthResult> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(request.UserId, out var userId))
        {
            return new AuthResult(false, "Invalid user ID.");
        }

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return new AuthResult(false, "User not found.");
        }

        if (user.EmailConfirmed)
        {
            return new AuthResult(true, "Email is already verified.");
        }

        var result = await _userManager.ConfirmEmailAsync(user, request.Token);
        if (!result.Succeeded)
        {
            return new AuthResult(
                false,
                "Email verification failed.",
                result.Errors.Select(e => e.Description));
        }

        // Send welcome email
        await _emailService.SendWelcomeEmailAsync(user.Email!, user.DisplayName);

        return new AuthResult(true, "Email verified successfully.");
    }
}
