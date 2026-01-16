using Microsoft.EntityFrameworkCore;
using MudListings.Application.DTOs.Users;
using MudListings.Application.Interfaces;
using MudListings.Infrastructure.Data;

namespace MudListings.Infrastructure.Repositories;

public class UserProfileRepository : IUserProfileRepository
{
    private readonly AppDbContext _context;

    public UserProfileRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PublicUserProfileDto?> GetPublicProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .Where(u => u.Id == userId && u.IsProfilePublic)
            .Select(u => new
            {
                u.Id,
                u.DisplayName,
                u.AvatarUrl,
                u.Bio,
                u.CreatedAt,
                u.ShowFavoritesPublicly,
                ReviewCount = u.Reviews.Count(r => !r.IsDeleted),
                FavoriteCount = u.Favorites.Count
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
        {
            return null;
        }

        return new PublicUserProfileDto(
            user.Id,
            user.DisplayName,
            user.AvatarUrl,
            user.Bio,
            user.CreatedAt,
            user.ReviewCount,
            user.ShowFavoritesPublicly ? user.FavoriteCount : 0
        );
    }

    public async Task<int> GetReviewCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Reviews
            .CountAsync(r => r.UserId == userId && !r.IsDeleted, cancellationToken);
    }

    public async Task<int> GetFavoriteCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Favorites
            .CountAsync(f => f.UserId == userId, cancellationToken);
    }
}
