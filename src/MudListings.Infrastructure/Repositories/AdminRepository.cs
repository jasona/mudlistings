using Microsoft.EntityFrameworkCore;
using MudListings.Application.DTOs.Admin;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;
using MudListings.Infrastructure.Data;

namespace MudListings.Infrastructure.Repositories;

public class AdminRepository : IAdminRepository
{
    private readonly AppDbContext _context;

    public AdminRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ModerationQueueDto> GetModerationQueueAsync(
        ReviewReportStatus? status = null,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ReviewReports
            .Include(r => r.Review)
                .ThenInclude(rev => rev.User)
            .Include(r => r.Review)
                .ThenInclude(rev => rev.Mud)
            .Include(r => r.Reporter)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }
        else
        {
            // Default to pending
            query = query.Where(r => r.Status == ReviewReportStatus.Pending);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ReportedReviewDto(
                r.Id,
                r.ReviewId,
                r.Review.Title ?? "",
                r.Review.Body,
                r.Review.Rating,
                r.Review.User.DisplayName,
                r.Review.UserId,
                r.Review.Mud.Name,
                r.Review.MudId,
                r.Reporter.DisplayName,
                r.ReporterId,
                r.Reason,
                r.Details,
                r.Status,
                r.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return new ModerationQueueDto(items, totalCount, page, pageSize);
    }

    public async Task<ReviewReport?> GetReportByIdAsync(Guid reportId, CancellationToken cancellationToken = default)
    {
        return await _context.ReviewReports
            .Include(r => r.Review)
            .FirstOrDefaultAsync(r => r.Id == reportId, cancellationToken);
    }

    public async Task UpdateReportAsync(ReviewReport report, CancellationToken cancellationToken = default)
    {
        _context.ReviewReports.Update(report);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task CreateAuditLogAsync(AuditLog log, CancellationToken cancellationToken = default)
    {
        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<AuditLogListDto> GetAuditLogsAsync(
        string? action = null,
        Guid? userId = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int page = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var query = _context.AuditLogs
            .Include(a => a.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(action))
        {
            query = query.Where(a => a.Action == action);
        }

        if (userId.HasValue)
        {
            query = query.Where(a => a.UserId == userId.Value);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt <= toDate.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogDto(
                a.Id,
                a.Action,
                a.TargetType ?? "",
                a.TargetId,
                null, // EntityName would need a join
                a.UserId,
                a.User.DisplayName,
                a.Details,
                a.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return new AuditLogListDto(items, totalCount, page, pageSize);
    }

    public async Task<SiteStatsDto> GetSiteStatsAsync(CancellationToken cancellationToken = default)
    {
        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);

        var totalMuds = await _context.Muds.CountAsync(m => !m.IsDeleted, cancellationToken);
        var onlineMuds = await _context.Muds.CountAsync(m => !m.IsDeleted && m.IsOnline, cancellationToken);
        var totalUsers = await _context.Users.CountAsync(cancellationToken);
        var totalReviews = await _context.Reviews.CountAsync(r => !r.IsDeleted, cancellationToken);
        var pendingReports = await _context.ReviewReports.CountAsync(r => r.Status == ReviewReportStatus.Pending, cancellationToken);
        var newMudsLast7Days = await _context.Muds.CountAsync(m => !m.IsDeleted && m.CreatedAt >= sevenDaysAgo, cancellationToken);
        var newUsersLast7Days = await _context.Users.CountAsync(u => u.CreatedAt >= sevenDaysAgo, cancellationToken);
        var newReviewsLast7Days = await _context.Reviews.CountAsync(r => !r.IsDeleted && r.CreatedAt >= sevenDaysAgo, cancellationToken);

        return new SiteStatsDto(
            totalMuds,
            onlineMuds,
            totalUsers,
            totalReviews,
            pendingReports,
            newMudsLast7Days,
            newUsersLast7Days,
            newReviewsLast7Days
        );
    }

    public async Task<IReadOnlyList<FeaturedMudDto>> GetFeaturedMudsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Muds
            .Where(m => m.IsFeatured && !m.IsDeleted)
            .OrderBy(m => m.FeaturedOrder)
            .Select(m => new FeaturedMudDto(
                m.Id,
                m.Name,
                m.Slug,
                m.FeaturedOrder ?? 0,
                m.FeaturedAt ?? m.CreatedAt
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task SetMudFeaturedAsync(Guid mudId, bool isFeatured, int? order = null, CancellationToken cancellationToken = default)
    {
        var mud = await _context.Muds.FindAsync(new object[] { mudId }, cancellationToken);
        if (mud == null) return;

        mud.IsFeatured = isFeatured;
        if (isFeatured)
        {
            mud.FeaturedAt = DateTime.UtcNow;
            mud.FeaturedOrder = order ?? await GetNextFeaturedOrderAsync(cancellationToken);
        }
        else
        {
            mud.FeaturedAt = null;
            mud.FeaturedOrder = null;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateFeaturedOrderAsync(IList<Guid> mudIds, CancellationToken cancellationToken = default)
    {
        for (int i = 0; i < mudIds.Count; i++)
        {
            var mud = await _context.Muds.FindAsync(new object[] { mudIds[i] }, cancellationToken);
            if (mud != null && mud.IsFeatured)
            {
                mud.FeaturedOrder = i + 1;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<int> GetNextFeaturedOrderAsync(CancellationToken cancellationToken)
    {
        var maxOrder = await _context.Muds
            .Where(m => m.IsFeatured)
            .MaxAsync(m => (int?)m.FeaturedOrder, cancellationToken);

        return (maxOrder ?? 0) + 1;
    }
}
