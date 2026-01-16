namespace MudListings.Application.Interfaces;

/// <summary>
/// Service for accessing the current authenticated user.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Gets the ID of the current authenticated user, or null if not authenticated.
    /// </summary>
    Guid? UserId { get; }

    /// <summary>
    /// Gets whether the current user is authenticated.
    /// </summary>
    bool IsAuthenticated { get; }

    /// <summary>
    /// Gets the email of the current authenticated user.
    /// </summary>
    string? Email { get; }

    /// <summary>
    /// Gets the roles of the current authenticated user.
    /// </summary>
    IEnumerable<string> Roles { get; }

    /// <summary>
    /// Checks if the current user is in the specified role.
    /// </summary>
    bool IsInRole(string role);
}
