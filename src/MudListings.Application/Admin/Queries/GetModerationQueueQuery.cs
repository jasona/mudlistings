using MediatR;
using MudListings.Application.DTOs.Admin;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Application.Admin.Queries;

/// <summary>
/// Query to get the moderation queue.
/// </summary>
public record GetModerationQueueQuery(
    ReviewReportStatus? Status = null,
    int Page = 1,
    int PageSize = 20
) : IRequest<ModerationQueueDto>;

public class GetModerationQueueQueryHandler : IRequestHandler<GetModerationQueueQuery, ModerationQueueDto>
{
    private readonly IAdminRepository _adminRepository;

    public GetModerationQueueQueryHandler(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public async Task<ModerationQueueDto> Handle(GetModerationQueueQuery request, CancellationToken cancellationToken)
    {
        return await _adminRepository.GetModerationQueueAsync(
            request.Status,
            request.Page,
            request.PageSize,
            cancellationToken);
    }
}
