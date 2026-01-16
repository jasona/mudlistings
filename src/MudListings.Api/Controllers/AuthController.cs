using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MudListings.Application.Auth.Commands;
using MudListings.Application.DTOs.Auth;

namespace MudListings.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Register a new user account.
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var command = new RegisterCommand(request.Email, request.Password, request.DisplayName);
        var result = await _mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(new { result.Message, result.Errors });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Log in with email and password.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var command = new LoginCommand(request.Email, request.Password);
        var result = await _mediator.Send(command);

        if (!result.Succeeded)
        {
            return Unauthorized(new { result.Message, result.Errors });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Refresh an access token using a refresh token.
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var command = new RefreshTokenCommand(request.RefreshToken);
        var result = await _mediator.Send(command);

        if (!result.Succeeded)
        {
            return Unauthorized(new { result.Message, result.Errors });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Verify email address with token.
    /// </summary>
    [HttpPost("verify-email")]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
    {
        var command = new VerifyEmailCommand(request.UserId, request.Token);
        var result = await _mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(new { result.Message, result.Errors });
        }

        return Ok(new { result.Message });
    }

    /// <summary>
    /// Request a password reset email.
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var command = new ForgotPasswordCommand(request.Email);
        var result = await _mediator.Send(command);

        // Always return success to prevent email enumeration
        return Ok(new { result.Message });
    }

    /// <summary>
    /// Reset password with token.
    /// </summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var command = new ResetPasswordCommand(request.Email, request.Token, request.NewPassword);
        var result = await _mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(new { result.Message, result.Errors });
        }

        return Ok(new { result.Message });
    }

    /// <summary>
    /// Login with external OAuth provider (Google, Discord).
    /// </summary>
    [HttpPost("external/{provider}")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ExternalLogin(string provider, [FromBody] ExternalLoginRequest request)
    {
        var command = new ExternalLoginCommand(provider, request.IdToken);
        var result = await _mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(new { result.Message, result.Errors });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Log out and revoke refresh tokens.
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        // TODO: Implement logout command to revoke tokens
        await Task.CompletedTask;
        return Ok(new { Message = "Logged out successfully." });
    }
}
