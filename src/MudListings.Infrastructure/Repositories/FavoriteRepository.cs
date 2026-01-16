using Microsoft.EntityFrameworkCore;
using MudListings.Application.DTOs.Favorites;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;
using MudListings.Infrastructure.Data;

namespace MudListings.Infrastructure.Repositories;

public class FavoriteRepository : IFavoriteRepository
{
    private readonly AppDbContext _context;

    public FavoriteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<FavoriteListDto> GetByUserIdAsync(Guid userId, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var query = _context.Favorites
            .Include(f => f.Mud)
            .ThenInclude(m => m.MudGenres)
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var skip = (page - 1) * pageSize;
        var favorites = await query
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = favorites.Select(f => new FavoriteDto(
            MudId: f.MudId,
            MudName: f.Mud.Name,
            MudSlug: f.Mud.Slug,
            ShortDescription: f.Mud.ShortDescription,
            Genres: f.Mud.MudGenres.Select(mg => mg.Genre.ToString()).ToList(),
            IsOnline: f.Mud.IsOnline,
            PlayerCount: f.Mud.CurrentMsspData?.Players,
            RatingAverage: f.Mud.AggregateRating.Average,
            RatingCount: f.Mud.AggregateRating.Count,
            FavoritedAt: f.CreatedAt
        )).ToList();

        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        return new FavoriteListDto(
            Items: items,
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize,
            TotalPages: totalPages
        );
    }

    public async Task<bool> IsFavoritedAsync(Guid userId, Guid mudId, CancellationToken cancellationToken = default)
    {
        return await _context.Favorites
            .AnyAsync(f => f.UserId == userId && f.MudId == mudId, cancellationToken);
    }

    public async Task<IReadOnlyList<Guid>> GetFavoritedMudIdsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Favorites
            .Where(f => f.UserId == userId)
            .Select(f => f.MudId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Favorite favorite, CancellationToken cancellationToken = default)
    {
        _context.Favorites.Add(favorite);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveAsync(Guid userId, Guid mudId, CancellationToken cancellationToken = default)
    {
        var favorite = await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.MudId == mudId, cancellationToken);

        if (favorite != null)
        {
            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<int> GetFavoriteCountForMudAsync(Guid mudId, CancellationToken cancellationToken = default)
    {
        return await _context.Favorites
            .CountAsync(f => f.MudId == mudId, cancellationToken);
    }

    public async Task<int> GetFavoriteCountForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Favorites
            .CountAsync(f => f.UserId == userId, cancellationToken);
    }
}
