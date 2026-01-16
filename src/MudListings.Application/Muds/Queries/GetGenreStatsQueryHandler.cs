using MediatR;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Muds.Queries;

public class GetGenreStatsQueryHandler : IRequestHandler<GetGenreStatsQuery, IReadOnlyList<GenreDto>>
{
    private readonly IMudRepository _mudRepository;

    public GetGenreStatsQueryHandler(IMudRepository mudRepository)
    {
        _mudRepository = mudRepository;
    }

    public async Task<IReadOnlyList<GenreDto>> Handle(GetGenreStatsQuery request, CancellationToken cancellationToken)
    {
        return await _mudRepository.GetGenreStatsAsync(cancellationToken);
    }
}
