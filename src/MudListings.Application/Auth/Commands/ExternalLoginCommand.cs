using MediatR;
using MudListings.Application.DTOs.Auth;

namespace MudListings.Application.Auth.Commands;

/// <summary>
/// Command for external OAuth login (Google, Discord).
/// </summary>
public record ExternalLoginCommand(
    string Provider,
    string IdToken
) : IRequest<AuthResult<AuthResponse>>;
