using MediatR;
using MudListings.Application.DTOs.Reviews;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Application.Reviews.Commands;

/// <summary>
/// Command to create a new review for a MUD.
/// </summary>
public record CreateReviewCommand(
    Guid MudId,
    Guid UserId,
    int Rating,
    string? Title,
    string Body
) : IRequest<ReviewDto?>;

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, ReviewDto?>
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IMudRepository _mudRepository;

    public CreateReviewCommandHandler(IReviewRepository reviewRepository, IMudRepository mudRepository)
    {
        _reviewRepository = reviewRepository;
        _mudRepository = mudRepository;
    }

    public async Task<ReviewDto?> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        // Verify MUD exists
        var mud = await _mudRepository.GetByIdAsync(request.MudId, cancellationToken);
        if (mud == null) return null;

        // Check if user has already reviewed this MUD
        var existingReview = await _reviewRepository.UserHasReviewedMudAsync(
            request.UserId, request.MudId, cancellationToken);
        if (existingReview) return null;

        var review = new Review
        {
            Id = Guid.NewGuid(),
            MudId = request.MudId,
            UserId = request.UserId,
            Rating = Math.Clamp(request.Rating, 1, 5),
            Title = request.Title,
            Body = request.Body,
            HelpfulCount = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _reviewRepository.CreateAsync(review, cancellationToken);

        // Update aggregate rating on MUD
        var (average, count) = await _reviewRepository.GetAggregateRatingAsync(request.MudId, cancellationToken);
        await _mudRepository.UpdateRatingAsync(request.MudId, average, count, cancellationToken);

        // Return the created review
        return await _reviewRepository.GetDetailByIdAsync(review.Id, request.UserId, cancellationToken);
    }
}
