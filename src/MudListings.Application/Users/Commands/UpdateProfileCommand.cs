using MediatR;
using MudListings.Application.DTOs.Auth;
using MudListings.Application.DTOs.Users;

namespace MudListings.Application.Users.Commands;

public record UpdateProfileCommand(
    Guid UserId,
    string? DisplayName,
    string? Bio,
    string? AvatarUrl,
    bool? IsProfilePublic,
    bool? ShowFavoritesPublicly
) : IRequest<AuthResult<UserProfileDto>>;
