using Microsoft.EntityFrameworkCore;
using MudListings.Application.DTOs.MudAdmin;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;
using MudListings.Infrastructure.Data;

namespace MudListings.Infrastructure.Repositories;

public class MudAdminRepository : IMudAdminRepository
{
    private readonly AppDbContext _context;

    public MudAdminRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<MudAdmin?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.MudAdmins
            .Include(ma => ma.User)
            .Include(ma => ma.Mud)
            .FirstOrDefaultAsync(ma => ma.Id == id, cancellationToken);
    }

    public async Task<MudAdmin?> GetByUserAndMudAsync(Guid userId, Guid mudId, CancellationToken cancellationToken = default)
    {
        return await _context.MudAdmins
            .Include(ma => ma.User)
            .Include(ma => ma.Mud)
            .FirstOrDefaultAsync(ma => ma.UserId == userId && ma.MudId == mudId, cancellationToken);
    }

    public async Task<IReadOnlyList<MudAdminDto>> GetAdminsForMudAsync(Guid mudId, CancellationToken cancellationToken = default)
    {
        var admins = await _context.MudAdmins
            .Include(ma => ma.User)
            .Where(ma => ma.MudId == mudId && ma.IsVerified)
            .OrderByDescending(ma => ma.IsOwner)
            .ThenBy(ma => ma.CreatedAt)
            .ToListAsync(cancellationToken);

        return admins.Select(ma => new MudAdminDto(
            ma.Id,
            ma.UserId,
            ma.User.DisplayName,
            ma.User.AvatarUrl,
            ma.IsOwner,
            ma.IsVerified,
            ma.VerificationMethod,
            ma.VerifiedAt,
            ma.CreatedAt
        )).ToList();
    }

    public async Task<IReadOnlyList<ManagedMudDto>> GetManagedMudsForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var adminRecords = await _context.MudAdmins
            .Include(ma => ma.Mud)
            .Where(ma => ma.UserId == userId && ma.IsVerified)
            .OrderByDescending(ma => ma.IsOwner)
            .ThenBy(ma => ma.Mud.Name)
            .ToListAsync(cancellationToken);

        return adminRecords.Select(ma => new ManagedMudDto(
            ma.MudId,
            ma.Mud.Name,
            ma.Mud.Slug,
            ma.IsOwner,
            ma.IsVerified,
            ma.Mud.IsOnline,
            ma.Mud.CurrentMsspData?.Players,
            ma.Mud.AggregateRating.Average,
            ma.Mud.AggregateRating.Count,
            ma.Mud.ViewCount,
            ma.Mud.FavoriteCount
        )).ToList();
    }

    public async Task<MudAdmin?> GetOwnerForMudAsync(Guid mudId, CancellationToken cancellationToken = default)
    {
        return await _context.MudAdmins
            .Include(ma => ma.User)
            .FirstOrDefaultAsync(ma => ma.MudId == mudId && ma.IsOwner && ma.IsVerified, cancellationToken);
    }

    public async Task<MudAdmin> CreateAsync(MudAdmin mudAdmin, CancellationToken cancellationToken = default)
    {
        _context.MudAdmins.Add(mudAdmin);
        await _context.SaveChangesAsync(cancellationToken);
        return mudAdmin;
    }

    public async Task UpdateAsync(MudAdmin mudAdmin, CancellationToken cancellationToken = default)
    {
        _context.MudAdmins.Update(mudAdmin);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var mudAdmin = await _context.MudAdmins.FindAsync([id], cancellationToken);
        if (mudAdmin != null)
        {
            _context.MudAdmins.Remove(mudAdmin);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<MudAdmin?> GetPendingClaimAsync(Guid claimId, CancellationToken cancellationToken = default)
    {
        return await _context.MudAdmins
            .Include(ma => ma.Mud)
            .FirstOrDefaultAsync(ma => ma.Id == claimId && !ma.IsVerified, cancellationToken);
    }

    public async Task<bool> HasPendingClaimAsync(Guid userId, Guid mudId, CancellationToken cancellationToken = default)
    {
        return await _context.MudAdmins
            .AnyAsync(ma => ma.UserId == userId && ma.MudId == mudId && !ma.IsVerified, cancellationToken);
    }

    public async Task<bool> IsUserAdminOfMudAsync(Guid userId, Guid mudId, CancellationToken cancellationToken = default)
    {
        return await _context.MudAdmins
            .AnyAsync(ma => ma.UserId == userId && ma.MudId == mudId && ma.IsVerified, cancellationToken);
    }

    public async Task<bool> IsUserOwnerOfMudAsync(Guid userId, Guid mudId, CancellationToken cancellationToken = default)
    {
        return await _context.MudAdmins
            .AnyAsync(ma => ma.UserId == userId && ma.MudId == mudId && ma.IsOwner && ma.IsVerified, cancellationToken);
    }

    public async Task<bool> IsMudClaimedAsync(Guid mudId, CancellationToken cancellationToken = default)
    {
        return await _context.MudAdmins
            .AnyAsync(ma => ma.MudId == mudId && ma.IsOwner && ma.IsVerified, cancellationToken);
    }
}
