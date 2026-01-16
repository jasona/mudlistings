using MediatR;
using MudListings.Application.Interfaces;

namespace MudListings.Application.MudAdmin.Commands;

/// <summary>
/// Command to transfer ownership of a MUD to another admin.
/// </summary>
public record TransferOwnershipCommand(
    Guid MudId,
    Guid CurrentOwnerUserId,
    Guid NewOwnerUserId
) : IRequest<TransferOwnershipResult>;

public record TransferOwnershipResult(
    bool Success,
    string Message
);

public class TransferOwnershipCommandHandler : IRequestHandler<TransferOwnershipCommand, TransferOwnershipResult>
{
    private readonly IMudAdminRepository _mudAdminRepository;

    public TransferOwnershipCommandHandler(IMudAdminRepository mudAdminRepository)
    {
        _mudAdminRepository = mudAdminRepository;
    }

    public async Task<TransferOwnershipResult> Handle(TransferOwnershipCommand request, CancellationToken cancellationToken)
    {
        // Verify requester is current owner
        var isOwner = await _mudAdminRepository.IsUserOwnerOfMudAsync(request.CurrentOwnerUserId, request.MudId, cancellationToken);
        if (!isOwner)
        {
            return new TransferOwnershipResult(false, "Only the owner can transfer ownership.");
        }

        // Get current owner record
        var currentOwner = await _mudAdminRepository.GetByUserAndMudAsync(request.CurrentOwnerUserId, request.MudId, cancellationToken);
        if (currentOwner == null)
        {
            return new TransferOwnershipResult(false, "Current owner record not found.");
        }

        // Get new owner - must be an existing admin
        var newOwner = await _mudAdminRepository.GetByUserAndMudAsync(request.NewOwnerUserId, request.MudId, cancellationToken);
        if (newOwner == null || !newOwner.IsVerified)
        {
            return new TransferOwnershipResult(false, "New owner must be an existing verified admin of this MUD.");
        }

        if (newOwner.IsOwner)
        {
            return new TransferOwnershipResult(false, "This user is already the owner.");
        }

        // Transfer ownership
        currentOwner.IsOwner = false;
        newOwner.IsOwner = true;

        await _mudAdminRepository.UpdateAsync(currentOwner, cancellationToken);
        await _mudAdminRepository.UpdateAsync(newOwner, cancellationToken);

        return new TransferOwnershipResult(true, "Ownership transferred successfully.");
    }
}
