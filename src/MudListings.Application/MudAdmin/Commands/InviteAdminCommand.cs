using MediatR;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace MudListings.Application.MudAdmin.Commands;

/// <summary>
/// Command to invite a user as admin for a MUD.
/// </summary>
public record InviteAdminCommand(
    Guid MudId,
    Guid InviterUserId,
    string InviteeEmail
) : IRequest<InviteAdminResult>;

public record InviteAdminResult(
    bool Success,
    string Message,
    Guid? InviteId = null
);

public class InviteAdminCommandHandler : IRequestHandler<InviteAdminCommand, InviteAdminResult>
{
    private readonly IMudAdminRepository _mudAdminRepository;
    private readonly IMudRepository _mudRepository;
    private readonly UserManager<User> _userManager;

    public InviteAdminCommandHandler(
        IMudAdminRepository mudAdminRepository,
        IMudRepository mudRepository,
        UserManager<User> userManager)
    {
        _mudAdminRepository = mudAdminRepository;
        _mudRepository = mudRepository;
        _userManager = userManager;
    }

    public async Task<InviteAdminResult> Handle(InviteAdminCommand request, CancellationToken cancellationToken)
    {
        // Verify inviter is owner of this MUD
        var isOwner = await _mudAdminRepository.IsUserOwnerOfMudAsync(request.InviterUserId, request.MudId, cancellationToken);
        if (!isOwner)
        {
            return new InviteAdminResult(false, "Only the owner can invite new admins.");
        }

        // Find the user by email
        var invitee = await _userManager.FindByEmailAsync(request.InviteeEmail);
        if (invitee == null)
        {
            return new InviteAdminResult(false, "User with this email not found.");
        }

        // Check if user is already an admin
        var existingAdmin = await _mudAdminRepository.GetByUserAndMudAsync(invitee.Id, request.MudId, cancellationToken);
        if (existingAdmin != null)
        {
            if (existingAdmin.IsVerified)
            {
                return new InviteAdminResult(false, "This user is already an admin of this MUD.");
            }
            else
            {
                return new InviteAdminResult(false, "This user already has a pending invitation.");
            }
        }

        // Create the admin invite (auto-verified since it's an invitation from owner)
        var invite = new Domain.Entities.MudAdmin
        {
            Id = Guid.NewGuid(),
            MudId = request.MudId,
            UserId = invitee.Id,
            IsOwner = false,
            IsVerified = true, // Auto-verified when invited by owner
            VerificationMethod = MudAdminVerificationMethod.ManualApproval,
            VerifiedAt = DateTime.UtcNow,
            InvitedAt = DateTime.UtcNow,
            InvitedByUserId = request.InviterUserId,
            CreatedAt = DateTime.UtcNow
        };

        await _mudAdminRepository.CreateAsync(invite, cancellationToken);

        return new InviteAdminResult(true, $"Successfully added {invitee.DisplayName} as an admin.", invite.Id);
    }
}
