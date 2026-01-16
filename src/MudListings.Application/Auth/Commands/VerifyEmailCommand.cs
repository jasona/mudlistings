using MediatR;
using MudListings.Application.DTOs.Auth;

namespace MudListings.Application.Auth.Commands;

/// <summary>
/// Command to verify a user's email.
/// </summary>
public record VerifyEmailCommand(
    string UserId,
    string Token
) : IRequest<AuthResult>;
