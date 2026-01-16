using MudListings.Application.DTOs.Reviews;
using MudListings.Domain.Entities;

namespace MudListings.Application.Interfaces;

/// <summary>
/// Repository interface for review operations.
/// </summary>
public interface IReviewRepository
{
    // Read operations
    Task<Review?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ReviewDto?> GetDetailByIdAsync(Guid id, Guid? currentUserId = null, CancellationToken cancellationToken = default);
    Task<ReviewListDto> GetByMudIdAsync(Guid mudId, Guid? currentUserId = null, ReviewSortBy sortBy = ReviewSortBy.Newest, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default);
    Task<ReviewListDto> GetByUserIdAsync(Guid userId, Guid? currentUserId = null, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default);

    // Write operations
    Task<Review> CreateAsync(Review review, CancellationToken cancellationToken = default);
    Task UpdateAsync(Review review, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    // Validation
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> UserHasReviewedMudAsync(Guid userId, Guid mudId, CancellationToken cancellationToken = default);
    Task<Review?> GetUserReviewForMudAsync(Guid userId, Guid mudId, CancellationToken cancellationToken = default);

    // Helpful votes
    Task<bool> HasUserVotedHelpfulAsync(Guid userId, Guid reviewId, CancellationToken cancellationToken = default);
    Task AddHelpfulVoteAsync(Guid userId, Guid reviewId, CancellationToken cancellationToken = default);
    Task RemoveHelpfulVoteAsync(Guid userId, Guid reviewId, CancellationToken cancellationToken = default);

    // Admin replies
    Task<ReviewReply> AddReplyAsync(ReviewReply reply, CancellationToken cancellationToken = default);
    Task UpdateReplyAsync(ReviewReply reply, CancellationToken cancellationToken = default);
    Task DeleteReplyAsync(Guid reviewId, CancellationToken cancellationToken = default);

    // Reports
    Task<ReviewReport> AddReportAsync(ReviewReport report, CancellationToken cancellationToken = default);
    Task<bool> HasUserReportedReviewAsync(Guid userId, Guid reviewId, CancellationToken cancellationToken = default);

    // Aggregate calculations
    Task<(double Average, int Count)> GetAggregateRatingAsync(Guid mudId, CancellationToken cancellationToken = default);
    Task<RatingDistributionDto> GetRatingDistributionAsync(Guid mudId, CancellationToken cancellationToken = default);
}
