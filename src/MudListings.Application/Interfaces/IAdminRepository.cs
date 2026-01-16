using MudListings.Application.DTOs.Admin;
using MudListings.Domain.Entities;

namespace MudListings.Application.Interfaces;

/// <summary>
/// Repository interface for site administration operations.
/// </summary>
public interface IAdminRepository
{
    // Moderation
    Task<ModerationQueueDto> GetModerationQueueAsync(
        ReviewReportStatus? status = null,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);

    Task<ReviewReport?> GetReportByIdAsync(Guid reportId, CancellationToken cancellationToken = default);
    Task UpdateReportAsync(ReviewReport report, CancellationToken cancellationToken = default);

    // Audit Logging
    Task CreateAuditLogAsync(AuditLog log, CancellationToken cancellationToken = default);
    Task<AuditLogListDto> GetAuditLogsAsync(
        string? action = null,
        Guid? userId = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int page = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default);

    // Statistics
    Task<SiteStatsDto> GetSiteStatsAsync(CancellationToken cancellationToken = default);

    // Featured Management
    Task<IReadOnlyList<FeaturedMudDto>> GetFeaturedMudsAsync(CancellationToken cancellationToken = default);
    Task SetMudFeaturedAsync(Guid mudId, bool isFeatured, int? order = null, CancellationToken cancellationToken = default);
    Task UpdateFeaturedOrderAsync(IList<Guid> mudIds, CancellationToken cancellationToken = default);
}
