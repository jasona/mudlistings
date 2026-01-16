using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MudListings.Application.DTOs.Favorites;
using MudListings.Application.Favorites.Commands;
using MudListings.Application.Favorites.Queries;
using MudListings.Application.Interfaces;

namespace MudListings.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FavoritesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public FavoritesController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get current user's favorites.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "Player")]
    [ProducesResponseType(typeof(FavoriteListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyFavorites(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var query = new GetUserFavoritesQuery(
            userId.Value,
            page,
            Math.Clamp(pageSize, 1, 50));

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get a user's favorites (if public).
    /// </summary>
    [HttpGet("user/{userId:guid}")]
    [ProducesResponseType(typeof(FavoriteListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserFavorites(
        Guid userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        // TODO: Check if user's profile is public before returning favorites
        var query = new GetUserFavoritesQuery(
            userId,
            page,
            Math.Clamp(pageSize, 1, 50));

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Toggle a MUD as favorite.
    /// </summary>
    [HttpPost("mud/{mudId:guid}")]
    [Authorize(Policy = "Player")]
    [ProducesResponseType(typeof(ToggleFavoriteResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleFavorite(Guid mudId)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var command = new ToggleFavoriteCommand(mudId, userId.Value);
        var result = await _mediator.Send(command);

        if (result == null)
        {
            return NotFound(new { Message = "MUD not found." });
        }

        return Ok(result);
    }

    /// <summary>
    /// Check if a MUD is favorited by current user.
    /// </summary>
    [HttpGet("mud/{mudId:guid}/check")]
    [Authorize(Policy = "Player")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CheckIsFavorite(Guid mudId)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var query = new CheckIsFavoriteQuery(userId.Value, mudId);
        var result = await _mediator.Send(query);

        return Ok(new { IsFavorited = result });
    }
}
