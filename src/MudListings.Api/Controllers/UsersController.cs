using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MudListings.Application.DTOs.Auth;
using MudListings.Application.DTOs.Users;
using MudListings.Application.Interfaces;
using MudListings.Application.Users.Commands;
using MudListings.Application.Users.Queries;

namespace MudListings.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public UsersController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get the current authenticated user's profile.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
        {
            return Unauthorized();
        }

        var query = new GetCurrentUserQuery(userId.Value);
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(new { Message = "User not found." });
        }

        return Ok(result);
    }

    /// <summary>
    /// Update the current authenticated user's profile.
    /// </summary>
    [HttpPut("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
        {
            return Unauthorized();
        }

        var command = new UpdateProfileCommand(
            userId.Value,
            request.DisplayName,
            request.Bio,
            request.AvatarUrl,
            request.IsProfilePublic,
            request.ShowFavoritesPublicly);

        var result = await _mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(new { result.Message, result.Errors });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Change the current user's password.
    /// </summary>
    [HttpPost("me/change-password")]
    [Authorize]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
        {
            return Unauthorized();
        }

        var command = new ChangePasswordCommand(
            userId.Value,
            request.CurrentPassword,
            request.NewPassword);

        var result = await _mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(new { result.Message, result.Errors });
        }

        return Ok(new { result.Message });
    }

    /// <summary>
    /// Get a user's public profile.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(PublicUserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserProfile(Guid id)
    {
        var query = new GetPublicUserQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(new { Message = "User not found or profile is private." });
        }

        return Ok(result);
    }
}
