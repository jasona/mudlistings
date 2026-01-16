using MediatR;
using MudListings.Application.DTOs.MudAdmin;
using MudListings.Application.Interfaces;

namespace MudListings.Application.MudAdmin.Queries;

/// <summary>
/// Query to get analytics for a MUD (admin only).
/// </summary>
public record GetMudAnalyticsQuery(
    Guid MudId,
    Guid AdminUserId
) : IRequest<MudAnalyticsDto?>;

public class GetMudAnalyticsQueryHandler : IRequestHandler<GetMudAnalyticsQuery, MudAnalyticsDto?>
{
    private readonly IMudAdminRepository _mudAdminRepository;
    private readonly IMudRepository _mudRepository;
    private readonly IReviewRepository _reviewRepository;
    private readonly IFavoriteRepository _favoriteRepository;

    public GetMudAnalyticsQueryHandler(
        IMudAdminRepository mudAdminRepository,
        IMudRepository mudRepository,
        IReviewRepository reviewRepository,
        IFavoriteRepository favoriteRepository)
    {
        _mudAdminRepository = mudAdminRepository;
        _mudRepository = mudRepository;
        _reviewRepository = reviewRepository;
        _favoriteRepository = favoriteRepository;
    }

    public async Task<MudAnalyticsDto?> Handle(GetMudAnalyticsQuery request, CancellationToken cancellationToken)
    {
        // Verify user is admin of this MUD
        var isAdmin = await _mudAdminRepository.IsUserAdminOfMudAsync(request.AdminUserId, request.MudId, cancellationToken);
        if (!isAdmin) return null;

        var mud = await _mudRepository.GetByIdAsync(request.MudId, cancellationToken);
        if (mud == null) return null;

        // Get review statistics
        var (averageRating, totalReviews) = await _reviewRepository.GetAggregateRatingAsync(request.MudId, cancellationToken);

        // Get favorite count
        var favoriteCount = await _favoriteRepository.GetFavoriteCountForMudAsync(request.MudId, cancellationToken);

        // View counts (would need time-based tracking in production)
        var totalViews = mud.ViewCount;

        // Player statistics from MSSP data
        int? averagePlayerCount = mud.CurrentMsspData?.Players;
        int? peakPlayerCount = mud.CurrentMsspData?.Players; // Would need historical tracking

        // Uptime percentage (would need historical status tracking)
        double? uptimePercentage = mud.IsOnline ? 100.0 : 0.0;

        return new MudAnalyticsDto(
            MudId: mud.Id,
            MudName: mud.Name,
            TotalViews: totalViews,
            ViewsLast7Days: 0,   // Would need time-based view tracking
            ViewsLast30Days: 0,  // Would need time-based view tracking
            TotalFavorites: favoriteCount,
            FavoritesLast7Days: 0,   // Would need time-based tracking
            FavoritesLast30Days: 0,  // Would need time-based tracking
            TotalReviews: totalReviews,
            ReviewsLast7Days: 0,   // Would need time-based tracking
            ReviewsLast30Days: 0,  // Would need time-based tracking
            AverageRating: averageRating,
            UptimePercentage: uptimePercentage,
            AveragePlayerCount: averagePlayerCount,
            PeakPlayerCount: peakPlayerCount
        );
    }
}
