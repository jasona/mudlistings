using MediatR;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Muds.Queries;

public class GetTrendingMudsQueryHandler : IRequestHandler<GetTrendingMudsQuery, IReadOnlyList<MudListDto>>
{
    private readonly IMudRepository _mudRepository;

    public GetTrendingMudsQueryHandler(IMudRepository mudRepository)
    {
        _mudRepository = mudRepository;
    }

    public async Task<IReadOnlyList<MudListDto>> Handle(GetTrendingMudsQuery request, CancellationToken cancellationToken)
    {
        return await _mudRepository.GetTrendingAsync(request.Limit, cancellationToken);
    }
}
