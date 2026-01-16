using MediatR;
using Microsoft.AspNetCore.Identity;
using MudListings.Application.DTOs.Auth;
using MudListings.Domain.Entities;

namespace MudListings.Application.Users.Commands;

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, AuthResult>
{
    private readonly UserManager<User> _userManager;

    public ChangePasswordCommandHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<AuthResult> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());

        if (user == null)
        {
            return new AuthResult(false, "User not found.");
        }

        var result = await _userManager.ChangePasswordAsync(
            user,
            request.CurrentPassword,
            request.NewPassword);

        if (!result.Succeeded)
        {
            return new AuthResult(
                false,
                "Failed to change password.",
                result.Errors.Select(e => e.Description));
        }

        return new AuthResult(true, "Password changed successfully.");
    }
}
