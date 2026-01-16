using MudListings.Domain.Enums;

namespace MudListings.Domain.Entities;

/// <summary>
/// Join entity for the many-to-many relationship between MUD and Genre.
/// </summary>
public class MudGenre
{
    public Guid MudId { get; set; }
    public Mud Mud { get; set; } = null!;

    public Genre Genre { get; set; }
}
