using MediatR;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Muds.Queries;

public class GetAutocompleteQueryHandler : IRequestHandler<GetAutocompleteQuery, IReadOnlyList<AutocompleteSuggestionDto>>
{
    private readonly IMudRepository _mudRepository;

    public GetAutocompleteQueryHandler(IMudRepository mudRepository)
    {
        _mudRepository = mudRepository;
    }

    public async Task<IReadOnlyList<AutocompleteSuggestionDto>> Handle(GetAutocompleteQuery request, CancellationToken cancellationToken)
    {
        return await _mudRepository.GetAutocompleteAsync(request.Query, request.Limit, cancellationToken);
    }
}
