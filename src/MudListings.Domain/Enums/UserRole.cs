namespace MudListings.Domain.Enums;

/// <summary>
/// User roles for authorization.
/// </summary>
public enum UserRole
{
    Anonymous = 0,
    Player = 1,
    MudAdmin = 2,
    SiteAdmin = 3
}
