using MediatR;
using MudListings.Application.DTOs.Reviews;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Reviews.Queries;

/// <summary>
/// Query to get a review by its ID.
/// </summary>
public record GetReviewByIdQuery(
    Guid ReviewId,
    Guid? CurrentUserId = null
) : IRequest<ReviewDto?>;

public class GetReviewByIdQueryHandler : IRequestHandler<GetReviewByIdQuery, ReviewDto?>
{
    private readonly IReviewRepository _reviewRepository;

    public GetReviewByIdQueryHandler(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<ReviewDto?> Handle(GetReviewByIdQuery request, CancellationToken cancellationToken)
    {
        return await _reviewRepository.GetDetailByIdAsync(
            request.ReviewId, request.CurrentUserId, cancellationToken);
    }
}
