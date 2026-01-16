using Microsoft.EntityFrameworkCore;
using MudListings.Application.DTOs.Reviews;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;
using MudListings.Infrastructure.Data;

namespace MudListings.Infrastructure.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly AppDbContext _context;

    public ReviewRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Review?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Mud)
            .Include(r => r.AdminReply)
            .ThenInclude(ar => ar!.AdminUser)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<ReviewDto?> GetDetailByIdAsync(Guid id, Guid? currentUserId = null, CancellationToken cancellationToken = default)
    {
        var review = await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Mud)
            .Include(r => r.AdminReply)
            .ThenInclude(ar => ar!.AdminUser)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (review == null) return null;

        var hasVotedHelpful = currentUserId.HasValue &&
            await HasUserVotedHelpfulAsync(currentUserId.Value, id, cancellationToken);

        return MapToDto(review, hasVotedHelpful);
    }

    public async Task<ReviewListDto> GetByMudIdAsync(
        Guid mudId,
        Guid? currentUserId = null,
        ReviewSortBy sortBy = ReviewSortBy.Newest,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Mud)
            .Include(r => r.AdminReply)
            .ThenInclude(ar => ar!.AdminUser)
            .Where(r => r.MudId == mudId);

        var totalCount = await query.CountAsync(cancellationToken);

        query = ApplySorting(query, sortBy);

        var skip = (page - 1) * pageSize;
        var reviews = await query
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        // Get helpful vote status for current user
        var reviewIds = reviews.Select(r => r.Id).ToList();
        var userVotes = currentUserId.HasValue
            ? await _context.ReviewHelpfuls
                .Where(h => reviewIds.Contains(h.ReviewId) && h.UserId == currentUserId.Value)
                .Select(h => h.ReviewId)
                .ToListAsync(cancellationToken)
            : new List<Guid>();

        var items = reviews.Select(r => MapToDto(r, userVotes.Contains(r.Id))).ToList();
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        // Get aggregate stats
        var (average, _) = await GetAggregateRatingAsync(mudId, cancellationToken);
        var distribution = await GetRatingDistributionAsync(mudId, cancellationToken);

        return new ReviewListDto(
            Items: items,
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize,
            TotalPages: totalPages,
            AverageRating: totalCount > 0 ? average : null,
            RatingDistribution: distribution
        );
    }

    public async Task<ReviewListDto> GetByUserIdAsync(
        Guid userId,
        Guid? currentUserId = null,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Mud)
            .Include(r => r.AdminReply)
            .ThenInclude(ar => ar!.AdminUser)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var skip = (page - 1) * pageSize;
        var reviews = await query
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var reviewIds = reviews.Select(r => r.Id).ToList();
        var userVotes = currentUserId.HasValue
            ? await _context.ReviewHelpfuls
                .Where(h => reviewIds.Contains(h.ReviewId) && h.UserId == currentUserId.Value)
                .Select(h => h.ReviewId)
                .ToListAsync(cancellationToken)
            : new List<Guid>();

        var items = reviews.Select(r => MapToDto(r, userVotes.Contains(r.Id))).ToList();
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        return new ReviewListDto(
            Items: items,
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize,
            TotalPages: totalPages,
            AverageRating: null,
            RatingDistribution: null
        );
    }

    private static IQueryable<Review> ApplySorting(IQueryable<Review> query, ReviewSortBy sortBy)
    {
        return sortBy switch
        {
            ReviewSortBy.Newest => query.OrderByDescending(r => r.CreatedAt),
            ReviewSortBy.Oldest => query.OrderBy(r => r.CreatedAt),
            ReviewSortBy.HighestRating => query.OrderByDescending(r => r.Rating).ThenByDescending(r => r.CreatedAt),
            ReviewSortBy.LowestRating => query.OrderBy(r => r.Rating).ThenByDescending(r => r.CreatedAt),
            ReviewSortBy.MostHelpful => query.OrderByDescending(r => r.HelpfulCount).ThenByDescending(r => r.CreatedAt),
            _ => query.OrderByDescending(r => r.CreatedAt)
        };
    }

    public async Task<Review> CreateAsync(Review review, CancellationToken cancellationToken = default)
    {
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync(cancellationToken);
        return review;
    }

    public async Task UpdateAsync(Review review, CancellationToken cancellationToken = default)
    {
        _context.Reviews.Update(review);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var review = await _context.Reviews.FindAsync([id], cancellationToken);
        if (review != null)
        {
            review.IsDeleted = true;
            review.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Reviews.AnyAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<bool> UserHasReviewedMudAsync(Guid userId, Guid mudId, CancellationToken cancellationToken = default)
    {
        return await _context.Reviews
            .AnyAsync(r => r.UserId == userId && r.MudId == mudId, cancellationToken);
    }

    public async Task<Review?> GetUserReviewForMudAsync(Guid userId, Guid mudId, CancellationToken cancellationToken = default)
    {
        return await _context.Reviews
            .FirstOrDefaultAsync(r => r.UserId == userId && r.MudId == mudId, cancellationToken);
    }

    public async Task<bool> HasUserVotedHelpfulAsync(Guid userId, Guid reviewId, CancellationToken cancellationToken = default)
    {
        return await _context.ReviewHelpfuls
            .AnyAsync(h => h.UserId == userId && h.ReviewId == reviewId, cancellationToken);
    }

    public async Task AddHelpfulVoteAsync(Guid userId, Guid reviewId, CancellationToken cancellationToken = default)
    {
        var vote = new ReviewHelpful
        {
            UserId = userId,
            ReviewId = reviewId,
            CreatedAt = DateTime.UtcNow
        };

        _context.ReviewHelpfuls.Add(vote);

        // Update helpful count on review
        await _context.Reviews
            .Where(r => r.Id == reviewId)
            .ExecuteUpdateAsync(s => s.SetProperty(r => r.HelpfulCount, r => r.HelpfulCount + 1), cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveHelpfulVoteAsync(Guid userId, Guid reviewId, CancellationToken cancellationToken = default)
    {
        var vote = await _context.ReviewHelpfuls
            .FirstOrDefaultAsync(h => h.UserId == userId && h.ReviewId == reviewId, cancellationToken);

        if (vote != null)
        {
            _context.ReviewHelpfuls.Remove(vote);

            await _context.Reviews
                .Where(r => r.Id == reviewId)
                .ExecuteUpdateAsync(s => s.SetProperty(r => r.HelpfulCount, r => Math.Max(0, r.HelpfulCount - 1)), cancellationToken);

            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<ReviewReply> AddReplyAsync(ReviewReply reply, CancellationToken cancellationToken = default)
    {
        _context.ReviewReplies.Add(reply);
        await _context.SaveChangesAsync(cancellationToken);
        return reply;
    }

    public async Task UpdateReplyAsync(ReviewReply reply, CancellationToken cancellationToken = default)
    {
        _context.ReviewReplies.Update(reply);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteReplyAsync(Guid reviewId, CancellationToken cancellationToken = default)
    {
        var reply = await _context.ReviewReplies
            .FirstOrDefaultAsync(r => r.ReviewId == reviewId, cancellationToken);

        if (reply != null)
        {
            _context.ReviewReplies.Remove(reply);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<ReviewReport> AddReportAsync(ReviewReport report, CancellationToken cancellationToken = default)
    {
        _context.ReviewReports.Add(report);
        await _context.SaveChangesAsync(cancellationToken);
        return report;
    }

    public async Task<bool> HasUserReportedReviewAsync(Guid userId, Guid reviewId, CancellationToken cancellationToken = default)
    {
        return await _context.ReviewReports
            .AnyAsync(r => r.ReporterId == userId && r.ReviewId == reviewId, cancellationToken);
    }

    public async Task<(double Average, int Count)> GetAggregateRatingAsync(Guid mudId, CancellationToken cancellationToken = default)
    {
        var stats = await _context.Reviews
            .Where(r => r.MudId == mudId)
            .GroupBy(r => r.MudId)
            .Select(g => new
            {
                Average = g.Average(r => (double)r.Rating),
                Count = g.Count()
            })
            .FirstOrDefaultAsync(cancellationToken);

        return stats != null ? (Math.Round(stats.Average, 2), stats.Count) : (0, 0);
    }

    public async Task<RatingDistributionDto> GetRatingDistributionAsync(Guid mudId, CancellationToken cancellationToken = default)
    {
        var distribution = await _context.Reviews
            .Where(r => r.MudId == mudId)
            .GroupBy(r => r.Rating)
            .Select(g => new { Rating = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        return new RatingDistributionDto(
            OneStar: distribution.FirstOrDefault(d => d.Rating == 1)?.Count ?? 0,
            TwoStar: distribution.FirstOrDefault(d => d.Rating == 2)?.Count ?? 0,
            ThreeStar: distribution.FirstOrDefault(d => d.Rating == 3)?.Count ?? 0,
            FourStar: distribution.FirstOrDefault(d => d.Rating == 4)?.Count ?? 0,
            FiveStar: distribution.FirstOrDefault(d => d.Rating == 5)?.Count ?? 0
        );
    }

    private static ReviewDto MapToDto(Review review, bool hasVotedHelpful)
    {
        return new ReviewDto(
            Id: review.Id,
            MudId: review.MudId,
            MudName: review.Mud.Name,
            MudSlug: review.Mud.Slug,
            User: new ReviewUserDto(
                review.User.Id,
                review.User.DisplayName,
                review.User.AvatarUrl
            ),
            Rating: review.Rating,
            Title: review.Title,
            Body: review.Body,
            HelpfulCount: review.HelpfulCount,
            HasVotedHelpful: hasVotedHelpful,
            AdminReply: review.AdminReply != null ? new ReviewReplyDto(
                review.AdminReply.Id,
                new ReviewUserDto(
                    review.AdminReply.AdminUser.Id,
                    review.AdminReply.AdminUser.DisplayName,
                    review.AdminReply.AdminUser.AvatarUrl
                ),
                review.AdminReply.Body,
                review.AdminReply.CreatedAt
            ) : null,
            CreatedAt: review.CreatedAt,
            UpdatedAt: review.UpdatedAt
        );
    }
}
