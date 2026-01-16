using MediatR;
using MudListings.Application.DTOs.Admin;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Admin.Queries;

/// <summary>
/// Query to get featured MUDs for admin management.
/// </summary>
public record GetFeaturedMudsQuery : IRequest<IReadOnlyList<FeaturedMudDto>>;

public class GetFeaturedMudsQueryHandler : IRequestHandler<GetFeaturedMudsQuery, IReadOnlyList<FeaturedMudDto>>
{
    private readonly IAdminRepository _adminRepository;

    public GetFeaturedMudsQueryHandler(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public async Task<IReadOnlyList<FeaturedMudDto>> Handle(GetFeaturedMudsQuery request, CancellationToken cancellationToken)
    {
        return await _adminRepository.GetFeaturedMudsAsync(cancellationToken);
    }
}
