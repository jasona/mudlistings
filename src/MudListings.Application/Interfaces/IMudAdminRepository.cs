using MudListings.Application.DTOs.MudAdmin;

namespace MudListings.Application.Interfaces;

/// <summary>
/// Repository interface for MUD admin operations.
/// </summary>
public interface IMudAdminRepository
{
    // Read operations
    Task<Domain.Entities.MudAdmin?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Domain.Entities.MudAdmin?> GetByUserAndMudAsync(Guid userId, Guid mudId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MudAdminDto>> GetAdminsForMudAsync(Guid mudId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ManagedMudDto>> GetManagedMudsForUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Domain.Entities.MudAdmin?> GetOwnerForMudAsync(Guid mudId, CancellationToken cancellationToken = default);

    // Write operations
    Task<Domain.Entities.MudAdmin> CreateAsync(Domain.Entities.MudAdmin mudAdmin, CancellationToken cancellationToken = default);
    Task UpdateAsync(Domain.Entities.MudAdmin mudAdmin, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    // Verification
    Task<Domain.Entities.MudAdmin?> GetPendingClaimAsync(Guid claimId, CancellationToken cancellationToken = default);
    Task<bool> HasPendingClaimAsync(Guid userId, Guid mudId, CancellationToken cancellationToken = default);

    // Validation
    Task<bool> IsUserAdminOfMudAsync(Guid userId, Guid mudId, CancellationToken cancellationToken = default);
    Task<bool> IsUserOwnerOfMudAsync(Guid userId, Guid mudId, CancellationToken cancellationToken = default);
    Task<bool> IsMudClaimedAsync(Guid mudId, CancellationToken cancellationToken = default);
}
