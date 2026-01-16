using MediatR;
using MudListings.Application.DTOs.Reviews;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Reviews.Queries;

/// <summary>
/// Query to get reviews for a specific MUD.
/// </summary>
public record GetReviewsByMudQuery(
    Guid MudId,
    Guid? CurrentUserId = null,
    ReviewSortBy SortBy = ReviewSortBy.Newest,
    int Page = 1,
    int PageSize = 10
) : IRequest<ReviewListDto>;

public class GetReviewsByMudQueryHandler : IRequestHandler<GetReviewsByMudQuery, ReviewListDto>
{
    private readonly IReviewRepository _reviewRepository;

    public GetReviewsByMudQueryHandler(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<ReviewListDto> Handle(GetReviewsByMudQuery request, CancellationToken cancellationToken)
    {
        return await _reviewRepository.GetByMudIdAsync(
            request.MudId,
            request.CurrentUserId,
            request.SortBy,
            request.Page,
            request.PageSize,
            cancellationToken);
    }
}
