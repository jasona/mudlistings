using MediatR;
using MudListings.Application.Interfaces;

namespace MudListings.Application.MudAdmin.Commands;

/// <summary>
/// Command to remove an admin from a MUD.
/// </summary>
public record RemoveAdminCommand(
    Guid MudId,
    Guid AdminIdToRemove,
    Guid RequestingUserId
) : IRequest<RemoveAdminResult>;

public record RemoveAdminResult(
    bool Success,
    string Message
);

public class RemoveAdminCommandHandler : IRequestHandler<RemoveAdminCommand, RemoveAdminResult>
{
    private readonly IMudAdminRepository _mudAdminRepository;

    public RemoveAdminCommandHandler(IMudAdminRepository mudAdminRepository)
    {
        _mudAdminRepository = mudAdminRepository;
    }

    public async Task<RemoveAdminResult> Handle(RemoveAdminCommand request, CancellationToken cancellationToken)
    {
        // Verify requester is owner of this MUD
        var isOwner = await _mudAdminRepository.IsUserOwnerOfMudAsync(request.RequestingUserId, request.MudId, cancellationToken);
        if (!isOwner)
        {
            return new RemoveAdminResult(false, "Only the owner can remove admins.");
        }

        // Get the admin to remove
        var adminToRemove = await _mudAdminRepository.GetByIdAsync(request.AdminIdToRemove, cancellationToken);
        if (adminToRemove == null || adminToRemove.MudId != request.MudId)
        {
            return new RemoveAdminResult(false, "Admin not found.");
        }

        // Cannot remove the owner
        if (adminToRemove.IsOwner)
        {
            return new RemoveAdminResult(false, "Cannot remove the owner. Use transfer ownership instead.");
        }

        await _mudAdminRepository.DeleteAsync(request.AdminIdToRemove, cancellationToken);

        return new RemoveAdminResult(true, "Admin removed successfully.");
    }
}
