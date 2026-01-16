using MediatR;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Application.Admin.Commands;

/// <summary>
/// Command to set or remove featured status for a MUD.
/// </summary>
public record SetFeaturedCommand(
    Guid MudId,
    bool IsFeatured,
    Guid AdminUserId
) : IRequest<SetFeaturedResult>;

public record SetFeaturedResult(
    bool Success,
    string Message
);

public class SetFeaturedCommandHandler : IRequestHandler<SetFeaturedCommand, SetFeaturedResult>
{
    private readonly IAdminRepository _adminRepository;
    private readonly IMudRepository _mudRepository;

    public SetFeaturedCommandHandler(
        IAdminRepository adminRepository,
        IMudRepository mudRepository)
    {
        _adminRepository = adminRepository;
        _mudRepository = mudRepository;
    }

    public async Task<SetFeaturedResult> Handle(SetFeaturedCommand request, CancellationToken cancellationToken)
    {
        var mud = await _mudRepository.GetByIdAsync(request.MudId, cancellationToken);
        if (mud == null)
        {
            return new SetFeaturedResult(false, "MUD not found.");
        }

        await _adminRepository.SetMudFeaturedAsync(request.MudId, request.IsFeatured, null, cancellationToken);

        // Create audit log
        var action = request.IsFeatured ? "Feature" : "Unfeature";
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = action,
            UserId = request.AdminUserId,
            TargetType = "Mud",
            TargetId = request.MudId,
            Details = $"{action}d MUD: {mud.Name}",
            CreatedAt = DateTime.UtcNow
        };

        await _adminRepository.CreateAuditLogAsync(auditLog, cancellationToken);

        var message = request.IsFeatured
            ? $"{mud.Name} has been added to featured MUDs."
            : $"{mud.Name} has been removed from featured MUDs.";

        return new SetFeaturedResult(true, message);
    }
}
