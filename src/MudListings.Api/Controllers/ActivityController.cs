using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MudListings.Application.Activity.Queries;
using MudListings.Application.DTOs.Activity;
using MudListings.Application.Interfaces;

namespace MudListings.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActivityController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public ActivityController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get the global activity feed.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ActivityFeedDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGlobalFeed(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetGlobalActivityFeedQuery(
            page,
            Math.Clamp(pageSize, 1, 50));

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get a personalized activity feed based on favorited MUDs.
    /// </summary>
    [HttpGet("personalized")]
    [Authorize(Policy = "Player")]
    [ProducesResponseType(typeof(ActivityFeedDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetPersonalizedFeed(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var query = new GetPersonalizedActivityFeedQuery(
            userId.Value,
            page,
            Math.Clamp(pageSize, 1, 50));

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get activity for a specific MUD.
    /// </summary>
    [HttpGet("mud/{mudId:guid}")]
    [ProducesResponseType(typeof(ActivityFeedDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMudActivity(
        Guid mudId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetMudActivityQuery(
            mudId,
            page,
            Math.Clamp(pageSize, 1, 50));

        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
