using MudListings.Domain.Enums;

namespace MudListings.Application.DTOs.Muds;

/// <summary>
/// Summary DTO for MUD list views.
/// </summary>
public record MudListDto(
    Guid Id,
    string Name,
    string Slug,
    string? ShortDescription,
    IReadOnlyList<string> Genres,
    bool IsOnline,
    int? PlayerCount,
    double RatingAverage,
    int RatingCount,
    int FavoriteCount,
    bool IsFeatured,
    DateTime CreatedAt
);

/// <summary>
/// Full detail DTO for MUD detail page.
/// </summary>
public record MudDetailDto(
    Guid Id,
    string Name,
    string Slug,
    string Description,
    string? ShortDescription,
    IReadOnlyList<string> Genres,
    ConnectionInfoDto Connection,
    string? Website,
    string? DiscordUrl,
    string? WikiUrl,
    string? Codebase,
    string? Language,
    DateTime? EstablishedDate,
    bool IsOnline,
    DateTime? LastOnlineCheck,
    MsspDataDto? CurrentStatus,
    double RatingAverage,
    int RatingCount,
    int FavoriteCount,
    int ViewCount,
    bool IsFeatured,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    bool IsFavorited,
    bool IsClaimedByCurrentUser
);

/// <summary>
/// Connection info DTO.
/// </summary>
public record ConnectionInfoDto(
    string? Host,
    int? Port,
    string? WebClientUrl
);

/// <summary>
/// MSSP data DTO.
/// </summary>
public record MsspDataDto(
    string? GameName,
    int? Players,
    int? MaxPlayers,
    long? Uptime,
    string? Codebase,
    string? Contact,
    string? Website,
    string? Language,
    string? Location,
    string? Family,
    IReadOnlyList<string> Protocols
);

/// <summary>
/// Search result DTO with pagination metadata.
/// </summary>
public record MudSearchResultDto(
    IReadOnlyList<MudListDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages,
    bool HasNextPage,
    bool HasPreviousPage
);

/// <summary>
/// Genre DTO with MUD count.
/// </summary>
public record GenreDto(
    string Name,
    string DisplayName,
    int MudCount
);

/// <summary>
/// Autocomplete suggestion DTO.
/// </summary>
public record AutocompleteSuggestionDto(
    Guid Id,
    string Name,
    string Slug,
    string? ShortDescription,
    bool IsOnline
);

/// <summary>
/// Search/filter parameters.
/// </summary>
public record MudSearchParams(
    string? Query = null,
    IReadOnlyList<Genre>? Genres = null,
    bool? IsOnline = null,
    int? MinPlayers = null,
    int? MaxPlayers = null,
    double? MinRating = null,
    DateTime? CreatedAfter = null,
    DateTime? CreatedBefore = null,
    MudSortBy SortBy = MudSortBy.TrendingScore,
    SortDirection SortDirection = SortDirection.Descending,
    int Page = 1,
    int PageSize = 20
);

/// <summary>
/// Sort options for MUD listings.
/// </summary>
public enum MudSortBy
{
    Name,
    PlayerCount,
    RatingAverage,
    RatingCount,
    FavoriteCount,
    CreatedAt,
    TrendingScore
}

/// <summary>
/// Sort direction.
/// </summary>
public enum SortDirection
{
    Ascending,
    Descending
}
