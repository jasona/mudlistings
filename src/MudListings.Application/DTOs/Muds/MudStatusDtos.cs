namespace MudListings.Application.DTOs.Muds;

/// <summary>
/// Current status of a MUD.
/// </summary>
public record MudCurrentStatusDto(
    Guid MudId,
    bool IsOnline,
    int? PlayerCount,
    DateTime? LastChecked,
    MsspDataDto? MsspData
);

/// <summary>
/// Historical status snapshot.
/// </summary>
public record MudStatusHistoryDto(
    DateTime CheckedAt,
    bool IsOnline,
    int? PlayerCount
);

/// <summary>
/// Status history response with aggregated data.
/// </summary>
public record MudStatusHistoryResponseDto(
    Guid MudId,
    string MudName,
    MudCurrentStatusDto CurrentStatus,
    IReadOnlyList<MudStatusHistoryDto> History,
    StatusStatsDto Stats
);

/// <summary>
/// Aggregated statistics from status history.
/// </summary>
public record StatusStatsDto(
    double UptimePercentage,
    int? AveragePlayerCount,
    int? PeakPlayerCount,
    DateTime? LastOnline
);
