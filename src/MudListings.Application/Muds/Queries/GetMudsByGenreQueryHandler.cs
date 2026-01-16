using MediatR;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Muds.Queries;

public class GetMudsByGenreQueryHandler : IRequestHandler<GetMudsByGenreQuery, IReadOnlyList<MudListDto>>
{
    private readonly IMudRepository _mudRepository;

    public GetMudsByGenreQueryHandler(IMudRepository mudRepository)
    {
        _mudRepository = mudRepository;
    }

    public async Task<IReadOnlyList<MudListDto>> Handle(GetMudsByGenreQuery request, CancellationToken cancellationToken)
    {
        return await _mudRepository.GetByGenreAsync(request.Genre, request.Limit, cancellationToken);
    }
}
