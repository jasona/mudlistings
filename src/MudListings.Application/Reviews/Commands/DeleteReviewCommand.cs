using MediatR;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Reviews.Commands;

/// <summary>
/// Command to delete a review (soft delete).
/// </summary>
public record DeleteReviewCommand(
    Guid ReviewId,
    Guid UserId,
    bool IsAdmin = false
) : IRequest<bool>;

public class DeleteReviewCommandHandler : IRequestHandler<DeleteReviewCommand, bool>
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IMudRepository _mudRepository;

    public DeleteReviewCommandHandler(IReviewRepository reviewRepository, IMudRepository mudRepository)
    {
        _reviewRepository = reviewRepository;
        _mudRepository = mudRepository;
    }

    public async Task<bool> Handle(DeleteReviewCommand request, CancellationToken cancellationToken)
    {
        var review = await _reviewRepository.GetByIdAsync(request.ReviewId, cancellationToken);
        if (review == null) return false;

        // Verify ownership or admin
        if (!request.IsAdmin && review.UserId != request.UserId) return false;

        var mudId = review.MudId;

        await _reviewRepository.DeleteAsync(request.ReviewId, cancellationToken);

        // Update aggregate rating on MUD
        var (average, count) = await _reviewRepository.GetAggregateRatingAsync(mudId, cancellationToken);
        await _mudRepository.UpdateRatingAsync(mudId, average, count, cancellationToken);

        return true;
    }
}
