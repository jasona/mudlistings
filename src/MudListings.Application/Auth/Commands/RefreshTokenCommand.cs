using MediatR;
using MudListings.Application.DTOs.Auth;

namespace MudListings.Application.Auth.Commands;

/// <summary>
/// Command to refresh an access token.
/// </summary>
public record RefreshTokenCommand(
    string RefreshToken
) : IRequest<AuthResult<AuthResponse>>;
