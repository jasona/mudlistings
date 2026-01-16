using Microsoft.AspNetCore.Identity;
using MudListings.Domain.Enums;

namespace MudListings.Domain.Entities;

/// <summary>
/// Application user extending ASP.NET Core Identity.
/// </summary>
public class User : IdentityUser<Guid>
{
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }

    public UserRole Role { get; set; } = UserRole.Player;

    public bool IsProfilePublic { get; set; } = true;
    public bool ShowFavoritesPublicly { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<MudAdmin> ManagedMuds { get; set; } = new List<MudAdmin>();
    public ICollection<ReviewHelpful> HelpfulVotes { get; set; } = new List<ReviewHelpful>();
    public ICollection<ActivityEvent> ActivityEvents { get; set; } = new List<ActivityEvent>();
}
