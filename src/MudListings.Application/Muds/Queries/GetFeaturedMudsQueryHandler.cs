using MediatR;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Muds.Queries;

public class GetFeaturedMudsQueryHandler : IRequestHandler<GetFeaturedMudsQuery, IReadOnlyList<MudListDto>>
{
    private readonly IMudRepository _mudRepository;

    public GetFeaturedMudsQueryHandler(IMudRepository mudRepository)
    {
        _mudRepository = mudRepository;
    }

    public async Task<IReadOnlyList<MudListDto>> Handle(GetFeaturedMudsQuery request, CancellationToken cancellationToken)
    {
        return await _mudRepository.GetFeaturedAsync(request.Limit, cancellationToken);
    }
}
