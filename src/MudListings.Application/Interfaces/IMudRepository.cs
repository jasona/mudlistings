using MudListings.Application.DTOs.Muds;
using MudListings.Domain.Entities;
using MudListings.Domain.Enums;

namespace MudListings.Application.Interfaces;

/// <summary>
/// Repository interface for MUD operations.
/// </summary>
public interface IMudRepository
{
    // Read operations
    Task<Mud?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Mud?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<MudDetailDto?> GetDetailByIdAsync(Guid id, Guid? currentUserId = null, CancellationToken cancellationToken = default);
    Task<MudDetailDto?> GetDetailBySlugAsync(string slug, Guid? currentUserId = null, CancellationToken cancellationToken = default);

    // Search and filtering
    Task<MudSearchResultDto> SearchAsync(MudSearchParams searchParams, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MudListDto>> GetFeaturedAsync(int limit = 5, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MudListDto>> GetTrendingAsync(int limit = 10, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MudListDto>> GetByGenreAsync(Genre genre, int limit = 10, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MudListDto>> GetRecentAsync(int limit = 10, CancellationToken cancellationToken = default);

    // Autocomplete
    Task<IReadOnlyList<AutocompleteSuggestionDto>> GetAutocompleteAsync(string query, int limit = 10, CancellationToken cancellationToken = default);

    // Genre stats
    Task<IReadOnlyList<GenreDto>> GetGenreStatsAsync(CancellationToken cancellationToken = default);

    // Write operations
    Task<Mud> CreateAsync(Mud mud, CancellationToken cancellationToken = default);
    Task UpdateAsync(Mud mud, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    // View tracking
    Task IncrementViewCountAsync(Guid id, CancellationToken cancellationToken = default);

    // Rating updates
    Task UpdateRatingAsync(Guid id, double averageRating, int reviewCount, CancellationToken cancellationToken = default);

    // Existence checks
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> SlugExistsAsync(string slug, Guid? excludeId = null, CancellationToken cancellationToken = default);

    // Status history
    Task<IReadOnlyList<MudStatusSnapshot>> GetStatusHistoryAsync(Guid mudId, int hours = 24, CancellationToken cancellationToken = default);
}

/// <summary>
/// Status snapshot for history queries.
/// </summary>
public record MudStatusSnapshot(
    DateTime CheckedAt,
    bool IsOnline,
    int? PlayerCount
);
