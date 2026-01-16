using MediatR;
using MudListings.Application.DTOs.Auth;

namespace MudListings.Application.Users.Commands;

public record ChangePasswordCommand(
    Guid UserId,
    string CurrentPassword,
    string NewPassword
) : IRequest<AuthResult>;
