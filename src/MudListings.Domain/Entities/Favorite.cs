namespace MudListings.Domain.Entities;

/// <summary>
/// Represents a user's favorite MUD.
/// </summary>
public class Favorite
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid MudId { get; set; }
    public Mud Mud { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
