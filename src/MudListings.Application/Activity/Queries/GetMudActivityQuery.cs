using MediatR;
using MudListings.Application.DTOs.Activity;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Activity.Queries;

/// <summary>
/// Query to get activity for a specific MUD.
/// </summary>
public record GetMudActivityQuery(
    Guid MudId,
    int Page = 1,
    int PageSize = 20
) : IRequest<ActivityFeedDto>;

public class GetMudActivityQueryHandler : IRequestHandler<GetMudActivityQuery, ActivityFeedDto>
{
    private readonly IActivityRepository _activityRepository;

    public GetMudActivityQueryHandler(IActivityRepository activityRepository)
    {
        _activityRepository = activityRepository;
    }

    public async Task<ActivityFeedDto> Handle(GetMudActivityQuery request, CancellationToken cancellationToken)
    {
        return await _activityRepository.GetMudActivityAsync(
            request.MudId,
            request.Page,
            request.PageSize,
            cancellationToken);
    }
}
