using MudListings.Domain.Common;
using MudListings.Domain.ValueObjects;

namespace MudListings.Domain.Entities;

/// <summary>
/// Historical snapshot of a MUD's MSSP status.
/// </summary>
public class MudStatus : BaseEntity
{
    public Guid MudId { get; set; }
    public Mud Mud { get; set; } = null!;

    public bool IsOnline { get; set; }
    public int? PlayerCount { get; set; }
    public long? Uptime { get; set; }

    /// <summary>
    /// Full MSSP data as JSON for historical reference.
    /// </summary>
    public string? MsspDataJson { get; set; }

    public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
}
