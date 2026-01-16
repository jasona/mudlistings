using MediatR;
using Microsoft.AspNetCore.Identity;
using MudListings.Application.DTOs.Users;
using MudListings.Domain.Entities;

namespace MudListings.Application.Users.Queries;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, UserProfileDto?>
{
    private readonly UserManager<User> _userManager;

    public GetCurrentUserQueryHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<UserProfileDto?> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());

        if (user == null)
        {
            return null;
        }

        return new UserProfileDto(
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
    }
}
