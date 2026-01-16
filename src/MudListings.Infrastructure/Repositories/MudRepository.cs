using Microsoft.EntityFrameworkCore;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;
using MudListings.Domain.Enums;
using MudListings.Infrastructure.Data;

namespace MudListings.Infrastructure.Repositories;

public class MudRepository : IMudRepository
{
    private readonly AppDbContext _context;

    public MudRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Mud?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Muds
            .Include(m => m.MudGenres)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public async Task<Mud?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _context.Muds
            .Include(m => m.MudGenres)
            .FirstOrDefaultAsync(m => m.Slug == slug, cancellationToken);
    }

    public async Task<MudDetailDto?> GetDetailByIdAsync(Guid id, Guid? currentUserId = null, CancellationToken cancellationToken = default)
    {
        return await GetDetailQueryAsync(m => m.Id == id, currentUserId, cancellationToken);
    }

    public async Task<MudDetailDto?> GetDetailBySlugAsync(string slug, Guid? currentUserId = null, CancellationToken cancellationToken = default)
    {
        return await GetDetailQueryAsync(m => m.Slug == slug, currentUserId, cancellationToken);
    }

    private async Task<MudDetailDto?> GetDetailQueryAsync(
        System.Linq.Expressions.Expression<Func<Mud, bool>> predicate,
        Guid? currentUserId,
        CancellationToken cancellationToken)
    {
        var query = _context.Muds
            .Include(m => m.MudGenres)
            .Include(m => m.Favorites)
            .Include(m => m.Admins)
            .Where(predicate);

        var mud = await query.FirstOrDefaultAsync(cancellationToken);

        if (mud == null)
            return null;

        var isFavorited = currentUserId.HasValue &&
            mud.Favorites.Any(f => f.UserId == currentUserId.Value);

        var isClaimedByCurrentUser = currentUserId.HasValue &&
            mud.Admins.Any(a => a.UserId == currentUserId.Value && a.IsVerified);

        return MapToDetailDto(mud, isFavorited, isClaimedByCurrentUser);
    }

    public async Task<MudSearchResultDto> SearchAsync(MudSearchParams searchParams, CancellationToken cancellationToken = default)
    {
        var query = _context.Muds
            .Include(m => m.MudGenres)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(searchParams.Query))
        {
            var searchTerm = searchParams.Query.ToLower();
            query = query.Where(m =>
                m.Name.ToLower().Contains(searchTerm) ||
                (m.Description != null && m.Description.ToLower().Contains(searchTerm)) ||
                (m.ShortDescription != null && m.ShortDescription.ToLower().Contains(searchTerm)));
        }

        if (searchParams.Genres?.Count > 0)
        {
            query = query.Where(m => m.MudGenres.Any(mg => searchParams.Genres.Contains(mg.Genre)));
        }

        if (searchParams.IsOnline.HasValue)
        {
            query = query.Where(m => m.IsOnline == searchParams.IsOnline.Value);
        }

        if (searchParams.MinPlayers.HasValue)
        {
            query = query.Where(m => m.CurrentMsspData != null && m.CurrentMsspData.Players >= searchParams.MinPlayers.Value);
        }

        if (searchParams.MaxPlayers.HasValue)
        {
            query = query.Where(m => m.CurrentMsspData != null && m.CurrentMsspData.Players <= searchParams.MaxPlayers.Value);
        }

        if (searchParams.MinRating.HasValue)
        {
            query = query.Where(m => m.AggregateRating.Average >= searchParams.MinRating.Value);
        }

        if (searchParams.CreatedAfter.HasValue)
        {
            query = query.Where(m => m.CreatedAt >= searchParams.CreatedAfter.Value);
        }

        if (searchParams.CreatedBefore.HasValue)
        {
            query = query.Where(m => m.CreatedAt <= searchParams.CreatedBefore.Value);
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        query = ApplySorting(query, searchParams.SortBy, searchParams.SortDirection);

        // Apply pagination
        var page = Math.Max(1, searchParams.Page);
        var pageSize = Math.Clamp(searchParams.PageSize, 1, 100);
        var skip = (page - 1) * pageSize;

        var muds = await query
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = muds.Select(MapToListDto).ToList();
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        return new MudSearchResultDto(
            Items: items,
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize,
            TotalPages: totalPages,
            HasNextPage: page < totalPages,
            HasPreviousPage: page > 1
        );
    }

    private static IQueryable<Mud> ApplySorting(IQueryable<Mud> query, MudSortBy sortBy, SortDirection direction)
    {
        return (sortBy, direction) switch
        {
            (MudSortBy.Name, SortDirection.Ascending) => query.OrderBy(m => m.Name),
            (MudSortBy.Name, SortDirection.Descending) => query.OrderByDescending(m => m.Name),
            (MudSortBy.PlayerCount, SortDirection.Ascending) => query.OrderBy(m => m.CurrentMsspData != null ? m.CurrentMsspData.Players : 0),
            (MudSortBy.PlayerCount, SortDirection.Descending) => query.OrderByDescending(m => m.CurrentMsspData != null ? m.CurrentMsspData.Players : 0),
            (MudSortBy.RatingAverage, SortDirection.Ascending) => query.OrderBy(m => m.AggregateRating.Average),
            (MudSortBy.RatingAverage, SortDirection.Descending) => query.OrderByDescending(m => m.AggregateRating.Average),
            (MudSortBy.RatingCount, SortDirection.Ascending) => query.OrderBy(m => m.AggregateRating.Count),
            (MudSortBy.RatingCount, SortDirection.Descending) => query.OrderByDescending(m => m.AggregateRating.Count),
            (MudSortBy.FavoriteCount, SortDirection.Ascending) => query.OrderBy(m => m.FavoriteCount),
            (MudSortBy.FavoriteCount, SortDirection.Descending) => query.OrderByDescending(m => m.FavoriteCount),
            (MudSortBy.CreatedAt, SortDirection.Ascending) => query.OrderBy(m => m.CreatedAt),
            (MudSortBy.CreatedAt, SortDirection.Descending) => query.OrderByDescending(m => m.CreatedAt),
            (MudSortBy.TrendingScore, SortDirection.Ascending) => query.OrderBy(m => m.TrendingScore),
            (MudSortBy.TrendingScore, SortDirection.Descending) => query.OrderByDescending(m => m.TrendingScore),
            _ => query.OrderByDescending(m => m.TrendingScore)
        };
    }

    public async Task<IReadOnlyList<MudListDto>> GetFeaturedAsync(int limit = 5, CancellationToken cancellationToken = default)
    {
        var muds = await _context.Muds
            .Include(m => m.MudGenres)
            .Where(m => m.IsFeatured)
            .OrderBy(m => m.FeaturedOrder)
            .ThenByDescending(m => m.TrendingScore)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return muds.Select(MapToListDto).ToList();
    }

    public async Task<IReadOnlyList<MudListDto>> GetTrendingAsync(int limit = 10, CancellationToken cancellationToken = default)
    {
        var muds = await _context.Muds
            .Include(m => m.MudGenres)
            .OrderByDescending(m => m.TrendingScore)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return muds.Select(MapToListDto).ToList();
    }

    public async Task<IReadOnlyList<MudListDto>> GetByGenreAsync(Genre genre, int limit = 10, CancellationToken cancellationToken = default)
    {
        var muds = await _context.Muds
            .Include(m => m.MudGenres)
            .Where(m => m.MudGenres.Any(mg => mg.Genre == genre))
            .OrderByDescending(m => m.TrendingScore)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return muds.Select(MapToListDto).ToList();
    }

    public async Task<IReadOnlyList<MudListDto>> GetRecentAsync(int limit = 10, CancellationToken cancellationToken = default)
    {
        var muds = await _context.Muds
            .Include(m => m.MudGenres)
            .OrderByDescending(m => m.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return muds.Select(MapToListDto).ToList();
    }

    public async Task<IReadOnlyList<AutocompleteSuggestionDto>> GetAutocompleteAsync(string query, int limit = 10, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            return [];

        var searchTerm = query.ToLower();

        var muds = await _context.Muds
            .Where(m => m.Name.ToLower().Contains(searchTerm))
            .OrderBy(m => m.Name.ToLower().StartsWith(searchTerm) ? 0 : 1)
            .ThenBy(m => m.Name)
            .Take(limit)
            .Select(m => new AutocompleteSuggestionDto(
                m.Id,
                m.Name,
                m.Slug,
                m.ShortDescription,
                m.IsOnline
            ))
            .ToListAsync(cancellationToken);

        return muds;
    }

    public async Task<IReadOnlyList<GenreDto>> GetGenreStatsAsync(CancellationToken cancellationToken = default)
    {
        var genreCounts = await _context.MudGenres
            .GroupBy(mg => mg.Genre)
            .Select(g => new { Genre = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var allGenres = Enum.GetValues<Genre>();

        return allGenres.Select(genre =>
        {
            var genreCount = genreCounts.FirstOrDefault(g => g.Genre == genre);
            return new GenreDto(
                genre.ToString(),
                GetGenreDisplayName(genre),
                genreCount?.Count ?? 0
            );
        }).ToList();
    }

    private static string GetGenreDisplayName(Genre genre)
    {
        return genre switch
        {
            Genre.SciFi => "Sci-Fi",
            Genre.PvP => "PvP",
            _ => genre.ToString()
        };
    }

    public async Task<Mud> CreateAsync(Mud mud, CancellationToken cancellationToken = default)
    {
        _context.Muds.Add(mud);
        await _context.SaveChangesAsync(cancellationToken);
        return mud;
    }

    public async Task UpdateAsync(Mud mud, CancellationToken cancellationToken = default)
    {
        _context.Muds.Update(mud);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var mud = await _context.Muds.FindAsync([id], cancellationToken);
        if (mud != null)
        {
            mud.IsDeleted = true;
            mud.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task IncrementViewCountAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _context.Muds
            .Where(m => m.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.ViewCount, m => m.ViewCount + 1), cancellationToken);
    }

    public async Task UpdateRatingAsync(Guid id, double averageRating, int reviewCount, CancellationToken cancellationToken = default)
    {
        var mud = await _context.Muds.FindAsync([id], cancellationToken);
        if (mud != null)
        {
            mud.AggregateRating = new Domain.ValueObjects.Rating(averageRating, reviewCount);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Muds.AnyAsync(m => m.Id == id, cancellationToken);
    }

    public async Task<bool> SlugExistsAsync(string slug, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Muds.Where(m => m.Slug == slug);

        if (excludeId.HasValue)
        {
            query = query.Where(m => m.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MudStatusSnapshot>> GetStatusHistoryAsync(Guid mudId, int hours = 24, CancellationToken cancellationToken = default)
    {
        var cutoff = DateTime.UtcNow.AddHours(-hours);

        var history = await _context.MudStatuses
            .Where(s => s.MudId == mudId && s.CheckedAt >= cutoff)
            .OrderByDescending(s => s.CheckedAt)
            .Select(s => new MudStatusSnapshot(
                s.CheckedAt,
                s.IsOnline,
                s.PlayerCount
            ))
            .ToListAsync(cancellationToken);

        return history;
    }

    private static MudListDto MapToListDto(Mud mud)
    {
        return new MudListDto(
            Id: mud.Id,
            Name: mud.Name,
            Slug: mud.Slug,
            ShortDescription: mud.ShortDescription,
            Genres: mud.MudGenres.Select(mg => mg.Genre.ToString()).ToList(),
            IsOnline: mud.IsOnline,
            PlayerCount: mud.CurrentMsspData?.Players,
            RatingAverage: mud.AggregateRating.Average,
            RatingCount: mud.AggregateRating.Count,
            FavoriteCount: mud.FavoriteCount,
            IsFeatured: mud.IsFeatured,
            CreatedAt: mud.CreatedAt
        );
    }

    private static MudDetailDto MapToDetailDto(Mud mud, bool isFavorited, bool isClaimedByCurrentUser)
    {
        return new MudDetailDto(
            Id: mud.Id,
            Name: mud.Name,
            Slug: mud.Slug,
            Description: mud.Description,
            ShortDescription: mud.ShortDescription,
            Genres: mud.MudGenres.Select(mg => mg.Genre.ToString()).ToList(),
            Connection: new ConnectionInfoDto(
                mud.Connection.Host,
                mud.Connection.Port,
                mud.Connection.WebClientUrl
            ),
            Website: mud.Website,
            DiscordUrl: mud.DiscordUrl,
            WikiUrl: mud.WikiUrl,
            Codebase: mud.Codebase,
            Language: mud.Language,
            EstablishedDate: mud.EstablishedDate,
            IsOnline: mud.IsOnline,
            LastOnlineCheck: mud.LastOnlineCheck,
            CurrentStatus: mud.CurrentMsspData != null ? new MsspDataDto(
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
            ) : null,
            RatingAverage: mud.AggregateRating.Average,
            RatingCount: mud.AggregateRating.Count,
            FavoriteCount: mud.FavoriteCount,
            ViewCount: mud.ViewCount,
            IsFeatured: mud.IsFeatured,
            CreatedAt: mud.CreatedAt,
            UpdatedAt: mud.UpdatedAt,
            IsFavorited: isFavorited,
            IsClaimedByCurrentUser: isClaimedByCurrentUser
        );
    }
}
