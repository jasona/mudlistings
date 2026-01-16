using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MudListings.Application.Interfaces;
using MudListings.Infrastructure.Data;

namespace MudListings.Infrastructure.Services;

public class TrendingService : ITrendingService
{
    private readonly AppDbContext _context;
    private readonly ILogger<TrendingService> _logger;

    // Weighting factors for trending score calculation
    private const double ViewWeight = 1.0;
    private const double FavoriteWeight = 5.0;
    private const double ReviewWeight = 10.0;
    private const double OnlineBonus = 20.0;
    private const double RecencyDecayDays = 30.0; // Score decays over 30 days

    public TrendingService(AppDbContext context, ILogger<TrendingService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<double> CalculateTrendingScoreAsync(Guid mudId, CancellationToken cancellationToken = default)
    {
        var mud = await _context.Muds
            .Include(m => m.Reviews)
            .FirstOrDefaultAsync(m => m.Id == mudId, cancellationToken);

        if (mud == null) return 0;

        // Base scores
        var viewScore = mud.ViewCount * ViewWeight;
        var favoriteScore = mud.FavoriteCount * FavoriteWeight;

        // Recent reviews get higher weight
        var now = DateTime.UtcNow;
        var reviewScore = mud.Reviews
            .Where(r => !r.IsDeleted)
            .Sum(r =>
            {
                var daysSinceReview = (now - r.CreatedAt).TotalDays;
                var recencyMultiplier = Math.Max(0, 1 - (daysSinceReview / RecencyDecayDays));
                return ReviewWeight * recencyMultiplier;
            });

        // Online bonus
        var onlineScore = mud.IsOnline ? OnlineBonus : 0;

        // Player count bonus (if online)
        var playerBonus = mud.IsOnline && mud.CurrentMsspData?.Players > 0
            ? Math.Log10((double)(mud.CurrentMsspData.Players + 1)) * 10
            : 0;

        // Rating bonus (higher rated MUDs get a boost)
        var ratingBonus = mud.AggregateRating.Count > 0
            ? mud.AggregateRating.Average * mud.AggregateRating.Count * 0.5
            : 0;

        // Apply recency decay to overall score based on last activity
        var lastActivity = mud.Reviews
            .Where(r => !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefault()?.CreatedAt ?? mud.CreatedAt;

        var daysSinceActivity = (now - lastActivity).TotalDays;
        var overallRecencyMultiplier = Math.Max(0.1, 1 - (daysSinceActivity / (RecencyDecayDays * 2)));

        var totalScore = (viewScore + favoriteScore + reviewScore + onlineScore + playerBonus + ratingBonus) * overallRecencyMultiplier;

        return Math.Round(totalScore, 2);
    }

    public async Task UpdateAllTrendingScoresAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting trending score update for all MUDs");

        var mudIds = await _context.Muds
            .Where(m => !m.IsDeleted)
            .Select(m => m.Id)
            .ToListAsync(cancellationToken);

        var updateCount = 0;
        foreach (var mudId in mudIds)
        {
            try
            {
                await UpdateTrendingScoreAsync(mudId, cancellationToken);
                updateCount++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update trending score for MUD {MudId}", mudId);
            }
        }

        _logger.LogInformation("Completed trending score update. Updated {Count} MUDs", updateCount);
    }

    public async Task UpdateTrendingScoreAsync(Guid mudId, CancellationToken cancellationToken = default)
    {
        var score = await CalculateTrendingScoreAsync(mudId, cancellationToken);

        await _context.Muds
            .Where(m => m.Id == mudId)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.TrendingScore, score), cancellationToken);
    }
}
