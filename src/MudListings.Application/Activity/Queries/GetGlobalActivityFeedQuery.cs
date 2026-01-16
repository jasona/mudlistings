using MediatR;
using MudListings.Application.DTOs.Activity;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Activity.Queries;

/// <summary>
/// Query to get the global activity feed.
/// </summary>
public record GetGlobalActivityFeedQuery(
    int Page = 1,
    int PageSize = 20
) : IRequest<ActivityFeedDto>;

public class GetGlobalActivityFeedQueryHandler : IRequestHandler<GetGlobalActivityFeedQuery, ActivityFeedDto>
{
    private readonly IActivityRepository _activityRepository;

    public GetGlobalActivityFeedQueryHandler(IActivityRepository activityRepository)
    {
        _activityRepository = activityRepository;
    }

    public async Task<ActivityFeedDto> Handle(GetGlobalActivityFeedQuery request, CancellationToken cancellationToken)
    {
        return await _activityRepository.GetGlobalFeedAsync(
            request.Page,
            request.PageSize,
            cancellationToken);
    }
}
