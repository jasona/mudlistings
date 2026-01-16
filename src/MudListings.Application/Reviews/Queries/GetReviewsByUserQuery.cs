using MediatR;
using MudListings.Application.DTOs.Reviews;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Reviews.Queries;

/// <summary>
/// Query to get reviews by a specific user.
/// </summary>
public record GetReviewsByUserQuery(
    Guid UserId,
    Guid? CurrentUserId = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<ReviewListDto>;

public class GetReviewsByUserQueryHandler : IRequestHandler<GetReviewsByUserQuery, ReviewListDto>
{
    private readonly IReviewRepository _reviewRepository;

    public GetReviewsByUserQueryHandler(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<ReviewListDto> Handle(GetReviewsByUserQuery request, CancellationToken cancellationToken)
    {
        return await _reviewRepository.GetByUserIdAsync(
            request.UserId,
            request.CurrentUserId,
            request.Page,
            request.PageSize,
            cancellationToken);
    }
}
