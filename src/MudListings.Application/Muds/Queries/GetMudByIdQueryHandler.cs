using MediatR;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Muds.Queries;

public class GetMudByIdQueryHandler : IRequestHandler<GetMudByIdQuery, MudDetailDto?>
{
    private readonly IMudRepository _mudRepository;

    public GetMudByIdQueryHandler(IMudRepository mudRepository)
    {
        _mudRepository = mudRepository;
    }

    public async Task<MudDetailDto?> Handle(GetMudByIdQuery request, CancellationToken cancellationToken)
    {
        var result = await _mudRepository.GetDetailByIdAsync(request.Id, request.CurrentUserId, cancellationToken);

        if (result != null)
        {
            // Increment view count (fire and forget)
            _ = _mudRepository.IncrementViewCountAsync(request.Id, CancellationToken.None);
        }

        return result;
    }
}
