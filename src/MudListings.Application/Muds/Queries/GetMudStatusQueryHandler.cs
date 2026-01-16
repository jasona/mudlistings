using MediatR;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Muds.Queries;

public class GetMudStatusQueryHandler : IRequestHandler<GetMudStatusQuery, MudCurrentStatusDto?>
{
    private readonly IMudRepository _mudRepository;

    public GetMudStatusQueryHandler(IMudRepository mudRepository)
    {
        _mudRepository = mudRepository;
    }

    public async Task<MudCurrentStatusDto?> Handle(GetMudStatusQuery request, CancellationToken cancellationToken)
    {
        var mud = await _mudRepository.GetByIdAsync(request.MudId, cancellationToken);

        if (mud == null)
        {
            return null;
        }

        MsspDataDto? msspData = null;
        if (mud.CurrentMsspData != null)
        {
            msspData = new MsspDataDto(
                mud.CurrentMsspData.GameName,
                mud.CurrentMsspData.Players,
                mud.CurrentMsspData.MaxPlayers,
                mud.CurrentMsspData.Uptime,
                mud.CurrentMsspData.Codebase,
                mud.CurrentMsspData.Contact,
                mud.CurrentMsspData.Website,
                mud.CurrentMsspData.Language,
                mud.CurrentMsspData.Location,
                mud.CurrentMsspData.Family,
                mud.CurrentMsspData.Protocols
            );
        }

        return new MudCurrentStatusDto(
            mud.Id,
            mud.IsOnline,
            mud.CurrentMsspData?.Players,
            mud.LastOnlineCheck,
            msspData
        );
    }
}
