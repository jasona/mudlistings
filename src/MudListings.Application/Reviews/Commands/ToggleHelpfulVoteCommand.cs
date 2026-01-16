using MediatR;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Reviews.Commands;

/// <summary>
/// Command to toggle a helpful vote on a review.
/// </summary>
public record ToggleHelpfulVoteCommand(
    Guid ReviewId,
    Guid UserId
) : IRequest<ToggleHelpfulResult>;

public record ToggleHelpfulResult(
    bool IsNowHelpful,
    int NewHelpfulCount
);

public class ToggleHelpfulVoteCommandHandler : IRequestHandler<ToggleHelpfulVoteCommand, ToggleHelpfulResult>
{
    private readonly IReviewRepository _reviewRepository;

    public ToggleHelpfulVoteCommandHandler(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<ToggleHelpfulResult> Handle(ToggleHelpfulVoteCommand request, CancellationToken cancellationToken)
    {
        var review = await _reviewRepository.GetByIdAsync(request.ReviewId, cancellationToken);
        if (review == null)
        {
            throw new InvalidOperationException("Review not found");
        }

        // Users cannot vote on their own reviews
        if (review.UserId == request.UserId)
        {
            throw new InvalidOperationException("Cannot vote on own review");
        }

        var hasVoted = await _reviewRepository.HasUserVotedHelpfulAsync(request.UserId, request.ReviewId, cancellationToken);

        if (hasVoted)
        {
            await _reviewRepository.RemoveHelpfulVoteAsync(request.UserId, request.ReviewId, cancellationToken);
        }
        else
        {
            await _reviewRepository.AddHelpfulVoteAsync(request.UserId, request.ReviewId, cancellationToken);
        }

        // Get updated review to return new count
        var updatedReview = await _reviewRepository.GetByIdAsync(request.ReviewId, cancellationToken);

        return new ToggleHelpfulResult(
            IsNowHelpful: !hasVoted,
            NewHelpfulCount: updatedReview?.HelpfulCount ?? 0
        );
    }
}
