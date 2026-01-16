using MediatR;
using MudListings.Application.DTOs.Auth;

namespace MudListings.Application.Auth.Commands;

/// <summary>
/// Command to register a new user.
/// </summary>
public record RegisterCommand(
    string Email,
    string Password,
    string DisplayName
) : IRequest<AuthResult<AuthResponse>>;
