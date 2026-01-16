using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MudListings.Application.DTOs.Reviews;
using MudListings.Application.Interfaces;
using MudListings.Application.Reviews.Commands;
using MudListings.Application.Reviews.Queries;

namespace MudListings.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public ReviewsController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get a review by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ReviewDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var currentUserId = _currentUserService.UserId;
        var query = new GetReviewByIdQuery(id, currentUserId);
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(new { Message = "Review not found." });
        }

        return Ok(result);
    }

    /// <summary>
    /// Get reviews for a specific MUD.
    /// </summary>
    [HttpGet("mud/{mudId:guid}")]
    [ProducesResponseType(typeof(ReviewListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByMud(
        Guid mudId,
        [FromQuery] ReviewSortBy sortBy = ReviewSortBy.Newest,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUserId = _currentUserService.UserId;
        var query = new GetReviewsByMudQuery(
            mudId,
            currentUserId,
            sortBy,
            page,
            Math.Clamp(pageSize, 1, 50));

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get reviews by a specific user.
    /// </summary>
    [HttpGet("user/{userId:guid}")]
    [ProducesResponseType(typeof(ReviewListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByUser(
        Guid userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUserId = _currentUserService.UserId;
        var query = new GetReviewsByUserQuery(
            userId,
            currentUserId,
            page,
            Math.Clamp(pageSize, 1, 50));

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Create a new review for a MUD.
    /// </summary>
    [HttpPost("mud/{mudId:guid}")]
    [Authorize(Policy = "Player")]
    [ProducesResponseType(typeof(ReviewDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(Guid mudId, [FromBody] CreateReviewRequest request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var command = new CreateReviewCommand(
            mudId,
            userId.Value,
            request.Rating,
            request.Title,
            request.Body);

        var result = await _mediator.Send(command);

        if (result == null)
        {
            return Conflict(new { Message = "You have already reviewed this MUD or the MUD does not exist." });
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Update an existing review.
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = "Player")]
    [ProducesResponseType(typeof(ReviewDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateReviewRequest request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var command = new UpdateReviewCommand(
            id,
            userId.Value,
            request.Rating,
            request.Title,
            request.Body);

        var result = await _mediator.Send(command);

        if (result == null)
        {
            return NotFound(new { Message = "Review not found or you don't have permission to edit it." });
        }

        return Ok(result);
    }

    /// <summary>
    /// Delete a review.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "Player")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var isAdmin = User.IsInRole("SiteAdmin");
        var command = new DeleteReviewCommand(id, userId.Value, isAdmin);
        var success = await _mediator.Send(command);

        if (!success)
        {
            return NotFound(new { Message = "Review not found or you don't have permission to delete it." });
        }

        return NoContent();
    }

    /// <summary>
    /// Toggle helpful vote on a review.
    /// </summary>
    [HttpPost("{id:guid}/helpful")]
    [Authorize(Policy = "Player")]
    [ProducesResponseType(typeof(ToggleHelpfulResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleHelpful(Guid id)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        try
        {
            var command = new ToggleHelpfulVoteCommand(id, userId.Value);
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Add or update admin reply to a review.
    /// </summary>
    [HttpPost("{id:guid}/reply")]
    [Authorize(Policy = "MudAdmin")]
    [ProducesResponseType(typeof(ReviewDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddReply(Guid id, [FromBody] ReplyToReviewRequest request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var command = new AddAdminReplyCommand(id, userId.Value, request.Body);
        var replyId = await _mediator.Send(command);

        if (replyId == null)
        {
            return NotFound(new { Message = "Review not found." });
        }

        // Return the updated review
        var query = new GetReviewByIdQuery(id, userId);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    /// Delete admin reply from a review.
    /// </summary>
    [HttpDelete("{id:guid}/reply")]
    [Authorize(Policy = "MudAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteReply(Guid id)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var command = new DeleteAdminReplyCommand(id, userId.Value);
        var success = await _mediator.Send(command);

        if (!success)
        {
            return NotFound(new { Message = "Review or reply not found." });
        }

        return NoContent();
    }

    /// <summary>
    /// Report a review for moderation.
    /// </summary>
    [HttpPost("{id:guid}/report")]
    [Authorize(Policy = "Player")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Report(Guid id, [FromBody] ReportReviewRequest request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var command = new ReportReviewCommand(id, userId.Value, request.Reason, request.Details);
        var success = await _mediator.Send(command);

        if (!success)
        {
            return BadRequest(new { Message = "Cannot report this review. Either it doesn't exist, you've already reported it, or you cannot report your own review." });
        }

        return Ok(new { Message = "Review reported successfully." });
    }
}
