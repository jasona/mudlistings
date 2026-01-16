using MediatR;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Muds.Queries;

public class SearchMudsQueryHandler : IRequestHandler<SearchMudsQuery, MudSearchResultDto>
{
    private readonly IMudRepository _mudRepository;

    public SearchMudsQueryHandler(IMudRepository mudRepository)
    {
        _mudRepository = mudRepository;
    }

    public async Task<MudSearchResultDto> Handle(SearchMudsQuery request, CancellationToken cancellationToken)
    {
        return await _mudRepository.SearchAsync(request.SearchParams, cancellationToken);
    }
}
