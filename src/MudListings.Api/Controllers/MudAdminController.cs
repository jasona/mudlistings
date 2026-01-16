using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MudListings.Application.DTOs.MudAdmin;
using MudListings.Application.MudAdmin.Commands;
using MudListings.Application.MudAdmin.Queries;
using System.Security.Claims;

namespace MudListings.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MudAdminController : ControllerBase
{
    private readonly IMediator _mediator;

    public MudAdminController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }

    /// <summary>
    /// Get all MUDs managed by the current user.
    /// </summary>
    [HttpGet("managed")]
    public async Task<ActionResult<IReadOnlyList<ManagedMudDto>>> GetManagedMuds()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var result = await _mediator.Send(new GetManagedMudsQuery(userId));
        return Ok(result);
    }

    /// <summary>
    /// Get all admins for a MUD.
    /// </summary>
    [HttpGet("{mudId:guid}/admins")]
    public async Task<ActionResult<IReadOnlyList<MudAdminDto>>> GetAdmins(Guid mudId)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var result = await _mediator.Send(new GetMudAdminsQuery(mudId, userId));
        if (result == null)
            return Forbid();

        return Ok(result);
    }

    /// <summary>
    /// Initiate a claim on a MUD.
    /// </summary>
    [HttpPost("{mudId:guid}/claim")]
    public async Task<ActionResult<ClaimInitiationDto>> InitiateClaim(Guid mudId, [FromBody] InitiateClaimRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var result = await _mediator.Send(new InitiateClaimCommand(mudId, userId, request.VerificationMethod));
        if (result == null)
            return BadRequest(new { message = "Unable to initiate claim. The MUD may already be claimed or you have a pending claim." });

        return Ok(result);
    }

    /// <summary>
    /// Verify a pending claim.
    /// </summary>
    [HttpPost("claims/{claimId:guid}/verify")]
    public async Task<ActionResult> VerifyClaim(Guid claimId)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var result = await _mediator.Send(new VerifyClaimCommand(claimId, userId));
        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    /// <summary>
    /// Update a MUD's information (admin only).
    /// </summary>
    [HttpPut("{mudId:guid}")]
    public async Task<ActionResult> UpdateMud(Guid mudId, [FromBody] UpdateMudRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var result = await _mediator.Send(new UpdateMudCommand(
            mudId,
            userId,
            request.Name,
            request.Description,
            request.ShortDescription,
            request.Host,
            request.Port,
            request.WebClientUrl,
            request.Website,
            request.DiscordUrl,
            request.WikiUrl,
            request.Codebase,
            request.Language,
            request.EstablishedDate,
            request.Genres
        ));

        if (result == null)
            return Forbid();

        return Ok(result);
    }

    /// <summary>
    /// Invite a user as admin for a MUD (owner only).
    /// </summary>
    [HttpPost("{mudId:guid}/admins/invite")]
    public async Task<ActionResult> InviteAdmin(Guid mudId, [FromBody] InviteAdminRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var result = await _mediator.Send(new InviteAdminCommand(mudId, userId, request.Email));
        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message, inviteId = result.InviteId });
    }

    /// <summary>
    /// Remove an admin from a MUD (owner only).
    /// </summary>
    [HttpDelete("{mudId:guid}/admins/{adminId:guid}")]
    public async Task<ActionResult> RemoveAdmin(Guid mudId, Guid adminId)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var result = await _mediator.Send(new RemoveAdminCommand(mudId, adminId, userId));
        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    /// <summary>
    /// Transfer ownership of a MUD to another admin (owner only).
    /// </summary>
    [HttpPost("{mudId:guid}/transfer-ownership")]
    public async Task<ActionResult> TransferOwnership(Guid mudId, [FromBody] TransferOwnershipRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var result = await _mediator.Send(new TransferOwnershipCommand(mudId, userId, request.NewOwnerUserId));
        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    /// <summary>
    /// Get analytics for a MUD (admin only).
    /// </summary>
    [HttpGet("{mudId:guid}/analytics")]
    public async Task<ActionResult<MudAnalyticsDto>> GetAnalytics(Guid mudId)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var result = await _mediator.Send(new GetMudAnalyticsQuery(mudId, userId));
        if (result == null)
            return Forbid();

        return Ok(result);
    }
}
