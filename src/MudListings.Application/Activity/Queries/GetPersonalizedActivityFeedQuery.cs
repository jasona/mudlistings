using MediatR;
using MudListings.Application.DTOs.Activity;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Activity.Queries;

/// <summary>
/// Query to get a personalized activity feed based on user's favorited MUDs.
/// </summary>
public record GetPersonalizedActivityFeedQuery(
    Guid UserId,
    int Page = 1,
    int PageSize = 20
) : IRequest<ActivityFeedDto>;

public class GetPersonalizedActivityFeedQueryHandler : IRequestHandler<GetPersonalizedActivityFeedQuery, ActivityFeedDto>
{
    private readonly IActivityRepository _activityRepository;

    public GetPersonalizedActivityFeedQueryHandler(IActivityRepository activityRepository)
    {
        _activityRepository = activityRepository;
    }

    public async Task<ActivityFeedDto> Handle(GetPersonalizedActivityFeedQuery request, CancellationToken cancellationToken)
    {
        return await _activityRepository.GetPersonalizedFeedAsync(
            request.UserId,
            request.Page,
            request.PageSize,
            cancellationToken);
    }
}
