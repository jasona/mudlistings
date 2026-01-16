using MediatR;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Application.Admin.Commands;

/// <summary>
/// Command to update the order of featured MUDs.
/// </summary>
public record UpdateFeaturedOrderCommand(
    IList<Guid> MudIds,
    Guid AdminUserId
) : IRequest<UpdateFeaturedOrderResult>;

public record UpdateFeaturedOrderResult(
    bool Success,
    string Message
);

public class UpdateFeaturedOrderCommandHandler : IRequestHandler<UpdateFeaturedOrderCommand, UpdateFeaturedOrderResult>
{
    private readonly IAdminRepository _adminRepository;

    public UpdateFeaturedOrderCommandHandler(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public async Task<UpdateFeaturedOrderResult> Handle(UpdateFeaturedOrderCommand request, CancellationToken cancellationToken)
    {
        if (request.MudIds.Count == 0)
        {
            return new UpdateFeaturedOrderResult(false, "No MUDs provided.");
        }

        await _adminRepository.UpdateFeaturedOrderAsync(request.MudIds, cancellationToken);

        // Create audit log
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = "UpdateFeaturedOrder",
            UserId = request.AdminUserId,
            TargetType = "Featured",
            Details = $"Reordered {request.MudIds.Count} featured MUDs",
            CreatedAt = DateTime.UtcNow
        };

        await _adminRepository.CreateAuditLogAsync(auditLog, cancellationToken);

        return new UpdateFeaturedOrderResult(true, "Featured order updated successfully.");
    }
}
