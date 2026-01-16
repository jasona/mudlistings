using System.Text.Json;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;
using MudListings.Domain.Enums;
using MudListings.Infrastructure.Data;

namespace MudListings.Infrastructure.Services;

public class ActivityService : IActivityService
{
    private readonly AppDbContext _context;

    public ActivityService(AppDbContext context)
    {
        _context = context;
    }

    public async Task CreateEventAsync(
        ActivityEventType type,
        Guid? userId,
        Guid? mudId,
        string description,
        object? metadata = null,
        CancellationToken cancellationToken = default)
    {
        var activityEvent = new ActivityEvent
        {
            Id = Guid.NewGuid(),
            Type = type,
            UserId = userId,
            MudId = mudId,
            Description = description,
            MetadataJson = metadata != null ? JsonSerializer.Serialize(metadata) : null,
            CreatedAt = DateTime.UtcNow
        };

        _context.ActivityEvents.Add(activityEvent);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task CreateNewListingEventAsync(Guid mudId, string mudName, CancellationToken cancellationToken = default)
    {
        await CreateEventAsync(
            ActivityEventType.NewListing,
            null,
            mudId,
            $"New MUD listing: {mudName}",
            new { MudName = mudName },
            cancellationToken);
    }

    public async Task CreateNewReviewEventAsync(Guid userId, Guid mudId, string mudName, int rating, CancellationToken cancellationToken = default)
    {
        await CreateEventAsync(
            ActivityEventType.NewReview,
            userId,
            mudId,
            $"New {rating}-star review for {mudName}",
            new { MudName = mudName, Rating = rating },
            cancellationToken);
    }

    public async Task CreateStatusChangeEventAsync(Guid mudId, string mudName, bool isOnline, CancellationToken cancellationToken = default)
    {
        var status = isOnline ? "online" : "offline";
        await CreateEventAsync(
            ActivityEventType.StatusChange,
            null,
            mudId,
            $"{mudName} is now {status}",
            new { MudName = mudName, IsOnline = isOnline },
            cancellationToken);
    }

    public async Task CreateFeaturedEventAsync(Guid mudId, string mudName, CancellationToken cancellationToken = default)
    {
        await CreateEventAsync(
            ActivityEventType.Featured,
            null,
            mudId,
            $"{mudName} is now featured!",
            new { MudName = mudName },
            cancellationToken);
    }
}
