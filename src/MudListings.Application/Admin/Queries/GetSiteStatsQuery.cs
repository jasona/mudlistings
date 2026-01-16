using MediatR;
using MudListings.Application.DTOs.Admin;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Admin.Queries;

/// <summary>
/// Query to get site statistics.
/// </summary>
public record GetSiteStatsQuery : IRequest<SiteStatsDto>;

public class GetSiteStatsQueryHandler : IRequestHandler<GetSiteStatsQuery, SiteStatsDto>
{
    private readonly IAdminRepository _adminRepository;

    public GetSiteStatsQueryHandler(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public async Task<SiteStatsDto> Handle(GetSiteStatsQuery request, CancellationToken cancellationToken)
    {
        return await _adminRepository.GetSiteStatsAsync(cancellationToken);
    }
}
