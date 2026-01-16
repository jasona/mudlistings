using MediatR;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Muds.Queries;

public class GetMudStatusHistoryQueryHandler : IRequestHandler<GetMudStatusHistoryQuery, MudStatusHistoryResponseDto?>
{
    private readonly IMudRepository _mudRepository;

    public GetMudStatusHistoryQueryHandler(IMudRepository mudRepository)
    {
        _mudRepository = mudRepository;
    }

    public async Task<MudStatusHistoryResponseDto?> Handle(GetMudStatusHistoryQuery request, CancellationToken cancellationToken)
    {
        var mud = await _mudRepository.GetByIdAsync(request.MudId, cancellationToken);

        if (mud == null)
        {
            return null;
        }

        var statusHistory = await _mudRepository.GetStatusHistoryAsync(request.MudId, request.Hours, cancellationToken);

        // Build current status
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

        var currentStatus = new MudCurrentStatusDto(
            mud.Id,
            mud.IsOnline,
            mud.CurrentMsspData?.Players,
            mud.LastOnlineCheck,
            msspData
        );

        // Map history
        var historyDtos = statusHistory
            .Select(h => new MudStatusHistoryDto(h.CheckedAt, h.IsOnline, h.PlayerCount))
            .ToList();

        // Calculate stats
        var stats = CalculateStats(statusHistory);

        return new MudStatusHistoryResponseDto(
            mud.Id,
            mud.Name,
            currentStatus,
            historyDtos,
            stats
        );
    }

    private static StatusStatsDto CalculateStats(IReadOnlyList<MudStatusSnapshot> history)
    {
        if (history.Count == 0)
        {
            return new StatusStatsDto(0, null, null, null);
        }

        var onlineCount = history.Count(h => h.IsOnline);
        var uptimePercentage = (double)onlineCount / history.Count * 100;

        var playerCounts = history
            .Where(h => h.PlayerCount.HasValue)
            .Select(h => h.PlayerCount!.Value)
            .ToList();

        int? averagePlayerCount = playerCounts.Count > 0 ? (int)playerCounts.Average() : null;
        int? peakPlayerCount = playerCounts.Count > 0 ? playerCounts.Max() : null;

        var lastOnline = history
            .Where(h => h.IsOnline)
            .OrderByDescending(h => h.CheckedAt)
            .FirstOrDefault()?.CheckedAt;

        return new StatusStatsDto(
            Math.Round(uptimePercentage, 2),
            averagePlayerCount,
            peakPlayerCount,
            lastOnline
        );
    }
}
