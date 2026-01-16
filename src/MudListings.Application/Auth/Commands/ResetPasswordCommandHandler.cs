using MediatR;
using Microsoft.AspNetCore.Identity;
using MudListings.Application.DTOs.Auth;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Application.Auth.Commands;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, AuthResult>
{
    private readonly UserManager<User> _userManager;
    private readonly ITokenService _tokenService;

    public ResetPasswordCommandHandler(
        UserManager<User> userManager,
        ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<AuthResult> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return new AuthResult(false, "Invalid reset request.");
        }

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
        {
            return new AuthResult(
                false,
                "Password reset failed.",
                result.Errors.Select(e => e.Description));
        }

        // Revoke all existing refresh tokens for security
        await _tokenService.RevokeRefreshTokensAsync(user.Id);

        return new AuthResult(true, "Password has been reset successfully.");
    }
}
