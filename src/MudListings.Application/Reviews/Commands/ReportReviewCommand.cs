using MediatR;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Application.Reviews.Commands;

/// <summary>
/// Command to report a review for moderation.
/// </summary>
public record ReportReviewCommand(
    Guid ReviewId,
    Guid ReporterId,
    string Reason,
    string? Details
) : IRequest<bool>;

public class ReportReviewCommandHandler : IRequestHandler<ReportReviewCommand, bool>
{
    private readonly IReviewRepository _reviewRepository;

    public ReportReviewCommandHandler(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<bool> Handle(ReportReviewCommand request, CancellationToken cancellationToken)
    {
        // Verify review exists
        var review = await _reviewRepository.GetByIdAsync(request.ReviewId, cancellationToken);
        if (review == null) return false;

        // Users cannot report their own reviews
        if (review.UserId == request.ReporterId) return false;

        // Check if user has already reported this review
        var hasReported = await _reviewRepository.HasUserReportedReviewAsync(
            request.ReporterId, request.ReviewId, cancellationToken);
        if (hasReported) return false;

        var report = new ReviewReport
        {
            Id = Guid.NewGuid(),
            ReviewId = request.ReviewId,
            ReporterId = request.ReporterId,
            Reason = request.Reason,
            Details = request.Details,
            Status = ReviewReportStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _reviewRepository.AddReportAsync(report, cancellationToken);
        return true;
    }
}
