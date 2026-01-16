using MudListings.Domain.Enums;

namespace MudListings.Application.DTOs.Activity;

/// <summary>
/// Activity event DTO for feed display.
/// </summary>
public record ActivityEventDto(
    Guid Id,
    ActivityEventType Type,
    string TypeName,
    ActivityUserDto? User,
    ActivityMudDto? Mud,
    string Description,
    DateTime CreatedAt
);

/// <summary>
/// User info for activity display.
/// </summary>
public record ActivityUserDto(
    Guid Id,
    string DisplayName,
    string? AvatarUrl
);

/// <summary>
/// MUD info for activity display.
/// </summary>
public record ActivityMudDto(
    Guid Id,
    string Name,
    string Slug,
    bool IsOnline
);

/// <summary>
/// Paginated activity feed response.
/// </summary>
public record ActivityFeedDto(
    IReadOnlyList<ActivityEventDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages,
    bool HasMore
);
