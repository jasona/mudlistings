using MediatR;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Muds.Queries;

public class GetMudBySlugQueryHandler : IRequestHandler<GetMudBySlugQuery, MudDetailDto?>
{
    private readonly IMudRepository _mudRepository;

    public GetMudBySlugQueryHandler(IMudRepository mudRepository)
    {
        _mudRepository = mudRepository;
    }

    public async Task<MudDetailDto?> Handle(GetMudBySlugQuery request, CancellationToken cancellationToken)
    {
        var result = await _mudRepository.GetDetailBySlugAsync(request.Slug, request.CurrentUserId, cancellationToken);

        if (result != null)
        {
            // Increment view count (fire and forget)
            _ = _mudRepository.IncrementViewCountAsync(result.Id, CancellationToken.None);
        }

        return result;
    }
}
