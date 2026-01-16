using MediatR;
using MudListings.Application.DTOs.Auth;

namespace MudListings.Application.Auth.Commands;

/// <summary>
/// Command to reset password with token.
/// </summary>
public record ResetPasswordCommand(
    string Email,
    string Token,
    string NewPassword
) : IRequest<AuthResult>;
