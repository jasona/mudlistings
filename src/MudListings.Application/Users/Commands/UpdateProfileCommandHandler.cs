using MediatR;
using Microsoft.AspNetCore.Identity;
using MudListings.Application.DTOs.Auth;
using MudListings.Application.DTOs.Users;
using MudListings.Domain.Entities;

namespace MudListings.Application.Users.Commands;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, AuthResult<UserProfileDto>>
{
    private readonly UserManager<User> _userManager;

    public UpdateProfileCommandHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<AuthResult<UserProfileDto>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());

        if (user == null)
        {
            return new AuthResult<UserProfileDto>(false, null, "User not found.");
        }

        // Update fields if provided
        if (!string.IsNullOrWhiteSpace(request.DisplayName))
        {
            user.DisplayName = request.DisplayName.Trim();
        }

        if (request.Bio != null)
        {
            user.Bio = string.IsNullOrWhiteSpace(request.Bio) ? null : request.Bio.Trim();
        }

        if (request.AvatarUrl != null)
        {
            user.AvatarUrl = string.IsNullOrWhiteSpace(request.AvatarUrl) ? null : request.AvatarUrl.Trim();
        }

        if (request.IsProfilePublic.HasValue)
        {
            user.IsProfilePublic = request.IsProfilePublic.Value;
        }

        if (request.ShowFavoritesPublicly.HasValue)
        {
            user.ShowFavoritesPublicly = request.ShowFavoritesPublicly.Value;
        }

        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return new AuthResult<UserProfileDto>(
                false,
                null,
                "Failed to update profile.",
                result.Errors.Select(e => e.Description));
        }

        var profileDto = new UserProfileDto(
            user.Id,
            user.Email!,
            user.DisplayName,
            user.AvatarUrl,
            user.Bio,
            user.Role.ToString(),
            user.IsProfilePublic,
            user.ShowFavoritesPublicly,
            user.EmailConfirmed,
            user.CreatedAt,
            user.LastLoginAt
        );

        return new AuthResult<UserProfileDto>(true, profileDto);
    }
}
