using Microsoft.EntityFrameworkCore;
using MudListings.Application.DTOs.Activity;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;
using MudListings.Infrastructure.Data;

namespace MudListings.Infrastructure.Repositories;

public class ActivityRepository : IActivityRepository
{
    private readonly AppDbContext _context;

    public ActivityRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ActivityFeedDto> GetGlobalFeedAsync(int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var query = _context.ActivityEvents
            .Include(e => e.User)
            .Include(e => e.Mud)
            .OrderByDescending(e => e.CreatedAt);

        return await ExecuteFeedQuery(query, page, pageSize, cancellationToken);
    }

    public async Task<ActivityFeedDto> GetPersonalizedFeedAsync(Guid userId, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        // Get user's favorited MUD IDs
        var favoritedMudIds = await _context.Favorites
            .Where(f => f.UserId == userId)
            .Select(f => f.MudId)
            .ToListAsync(cancellationToken);

        if (favoritedMudIds.Count == 0)
        {
            // Return empty feed if no favorites
            return new ActivityFeedDto(
                Items: new List<ActivityEventDto>(),
                TotalCount: 0,
                Page: page,
                PageSize: pageSize,
                TotalPages: 0,
                HasMore: false
            );
        }

        var query = _context.ActivityEvents
            .Include(e => e.User)
            .Include(e => e.Mud)
            .Where(e => e.MudId.HasValue && favoritedMudIds.Contains(e.MudId.Value))
            .OrderByDescending(e => e.CreatedAt);

        return await ExecuteFeedQuery(query, page, pageSize, cancellationToken);
    }

    public async Task<ActivityFeedDto> GetMudActivityAsync(Guid mudId, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var query = _context.ActivityEvents
            .Include(e => e.User)
            .Include(e => e.Mud)
            .Where(e => e.MudId == mudId)
            .OrderByDescending(e => e.CreatedAt);

        return await ExecuteFeedQuery(query, page, pageSize, cancellationToken);
    }

    private static async Task<ActivityFeedDto> ExecuteFeedQuery(
        IQueryable<ActivityEvent> query,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var totalCount = await query.CountAsync(cancellationToken);

        var skip = (page - 1) * pageSize;
        var events = await query
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = events.Select(e => MapToDto(e)).ToList();
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        return new ActivityFeedDto(
            Items: items,
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize,
            TotalPages: totalPages,
            HasMore: page < totalPages
        );
    }

    private static ActivityEventDto MapToDto(ActivityEvent e)
    {
        return new ActivityEventDto(
            Id: e.Id,
            Type: e.Type,
            TypeName: e.Type.ToString(),
            User: e.User != null ? new ActivityUserDto(
                e.User.Id,
                e.User.DisplayName,
                e.User.AvatarUrl
            ) : null,
            Mud: e.Mud != null ? new ActivityMudDto(
                e.Mud.Id,
                e.Mud.Name,
                e.Mud.Slug,
                e.Mud.IsOnline
            ) : null,
            Description: e.Description,
            CreatedAt: e.CreatedAt
        );
    }
}
