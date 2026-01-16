using MudListings.Domain.Common;

namespace MudListings.Domain.Entities;

/// <summary>
/// Audit log entry for admin actions.
/// </summary>
public class AuditLog : BaseEntity
{
    public string Action { get; set; } = string.Empty;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string? TargetType { get; set; }
    public Guid? TargetId { get; set; }

    public string? Details { get; set; }
    public string? IpAddress { get; set; }
}
