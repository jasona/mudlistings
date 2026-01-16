using MediatR;
using MudListings.Application.DTOs.Reviews;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Reviews.Commands;

/// <summary>
/// Command to update an existing review.
/// </summary>
public record UpdateReviewCommand(
    Guid ReviewId,
    Guid UserId,
    int Rating,
    string? Title,
    string Body
) : IRequest<ReviewDto?>;

public class UpdateReviewCommandHandler : IRequestHandler<UpdateReviewCommand, ReviewDto?>
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IMudRepository _mudRepository;

    public UpdateReviewCommandHandler(IReviewRepository reviewRepository, IMudRepository mudRepository)
    {
        _reviewRepository = reviewRepository;
        _mudRepository = mudRepository;
    }

    public async Task<ReviewDto?> Handle(UpdateReviewCommand request, CancellationToken cancellationToken)
    {
        var review = await _reviewRepository.GetByIdAsync(request.ReviewId, cancellationToken);
        if (review == null) return null;

        // Verify ownership
        if (review.UserId != request.UserId) return null;

        review.Rating = Math.Clamp(request.Rating, 1, 5);
        review.Title = request.Title;
        review.Body = request.Body;
        review.UpdatedAt = DateTime.UtcNow;

        await _reviewRepository.UpdateAsync(review, cancellationToken);

        // Update aggregate rating on MUD
        var (average, count) = await _reviewRepository.GetAggregateRatingAsync(review.MudId, cancellationToken);
        await _mudRepository.UpdateRatingAsync(review.MudId, average, count, cancellationToken);

        return await _reviewRepository.GetDetailByIdAsync(review.Id, request.UserId, cancellationToken);
    }
}
