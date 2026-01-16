namespace MudListings.Application.DTOs.Favorites;

/// <summary>
/// Favorite MUD DTO for list views.
/// </summary>
public record FavoriteDto(
    Guid MudId,
    string MudName,
    string MudSlug,
    string? ShortDescription,
    IReadOnlyList<string> Genres,
    bool IsOnline,
    int? PlayerCount,
    double RatingAverage,
    int RatingCount,
    DateTime FavoritedAt
);

/// <summary>
/// Paginated favorites list response.
/// </summary>
public record FavoriteListDto(
    IReadOnlyList<FavoriteDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

/// <summary>
/// Response for favorite toggle operation.
/// </summary>
public record ToggleFavoriteResult(
    bool IsFavorited,
    int NewFavoriteCount
);
