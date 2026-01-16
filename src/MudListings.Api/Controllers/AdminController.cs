using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MudListings.Application.Admin.Commands;
using MudListings.Application.Admin.Queries;
using MudListings.Application.DTOs.Admin;
using MudListings.Domain.Entities;
using System.Security.Claims;

namespace MudListings.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SiteAdmin")]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }

    #region Statistics

    /// <summary>
    /// Get site statistics for admin dashboard.
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<SiteStatsDto>> GetStats()
    {
        var result = await _mediator.Send(new GetSiteStatsQuery());
        return Ok(result);
    }

    #endregion

    #region Moderation

    /// <summary>
    /// Get the moderation queue.
    /// </summary>
    [HttpGet("moderation")]
    public async Task<ActionResult<ModerationQueueDto>> GetModerationQueue(
        [FromQuery] ReviewReportStatus? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetModerationQueueQuery(status, page, pageSize));
        return Ok(result);
    }

    /// <summary>
    /// Moderate a reported review.
    /// </summary>
    [HttpPost("moderation/{reportId:guid}")]
    public async Task<ActionResult> ModerateContent(Guid reportId, [FromBody] ModerateContentRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var result = await _mediator.Send(new ModerateContentCommand(
            reportId,
            userId,
            request.Action,
            request.Resolution));

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    #endregion

    #region Bulk Import

    /// <summary>
    /// Import MUDs from CSV data.
    /// </summary>
    [HttpPost("import")]
    public async Task<ActionResult<ImportResultDto>> ImportMuds([FromBody] IReadOnlyList<ImportMudRow> rows)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var result = await _mediator.Send(new ImportMudsCommand(rows, userId));
        return Ok(result);
    }

    #endregion

    #region Featured Management

    /// <summary>
    /// Get featured MUDs for management.
    /// </summary>
    [HttpGet("featured")]
    public async Task<ActionResult<IReadOnlyList<FeaturedMudDto>>> GetFeaturedMuds()
    {
        var result = await _mediator.Send(new GetFeaturedMudsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Add a MUD to featured.
    /// </summary>
    [HttpPost("muds/{mudId:guid}/feature")]
    public async Task<ActionResult> FeatureMud(Guid mudId)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var result = await _mediator.Send(new SetFeaturedCommand(mudId, true, userId));

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    /// <summary>
    /// Remove a MUD from featured.
    /// </summary>
    [HttpDelete("muds/{mudId:guid}/feature")]
    public async Task<ActionResult> UnfeatureMud(Guid mudId)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var result = await _mediator.Send(new SetFeaturedCommand(mudId, false, userId));

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    /// <summary>
    /// Update the order of featured MUDs.
    /// </summary>
    [HttpPut("featured/order")]
    public async Task<ActionResult> UpdateFeaturedOrder([FromBody] SetFeaturedOrderRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var result = await _mediator.Send(new UpdateFeaturedOrderCommand(request.MudIds, userId));

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    #endregion

    #region User Management

    /// <summary>
    /// Get users for admin management.
    /// </summary>
    [HttpGet("users")]
    public async Task<ActionResult<AdminUserListDto>> GetUsers(
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetUsersQuery(search, role, page, pageSize));
        return Ok(result);
    }

    /// <summary>
    /// Change a user's role.
    /// </summary>
    [HttpPut("users/{userId:guid}/role")]
    public async Task<ActionResult> ChangeUserRole(Guid userId, [FromBody] ChangeUserRoleRequest request)
    {
        var adminUserId = GetUserId();
        if (adminUserId == Guid.Empty)
            return Unauthorized();

        var result = await _mediator.Send(new ChangeUserRoleCommand(userId, request.Role, adminUserId));

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    #endregion

    #region MUD Management

    /// <summary>
    /// Manually create a MUD.
    /// </summary>
    [HttpPost("muds")]
    public async Task<ActionResult> CreateMud([FromBody] CreateMudRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var result = await _mediator.Send(new CreateMudCommand(request, userId));

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message, mudId = result.MudId });
    }

    #endregion

    #region Audit Logs

    /// <summary>
    /// Get audit logs.
    /// </summary>
    [HttpGet("audit")]
    public async Task<ActionResult<AuditLogListDto>> GetAuditLogs(
        [FromQuery] string? action = null,
        [FromQuery] Guid? userId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await _mediator.Send(new GetAuditLogsQuery(action, userId, fromDate, toDate, page, pageSize));
        return Ok(result);
    }

    #endregion
}
