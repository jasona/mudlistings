using MediatR;
using MudListings.Application.DTOs.Auth;

namespace MudListings.Application.Auth.Commands;

/// <summary>
/// Command to initiate password reset.
/// </summary>
public record ForgotPasswordCommand(
    string Email
) : IRequest<AuthResult>;
