using MediatR;
using MudListings.Application.DTOs.Auth;

namespace MudListings.Application.Auth.Commands;

/// <summary>
/// Command to log in a user.
/// </summary>
public record LoginCommand(
    string Email,
    string Password
) : IRequest<AuthResult<AuthResponse>>;
