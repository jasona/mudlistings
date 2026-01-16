using MudListings.Domain.ValueObjects;

namespace MudListings.Application.Interfaces;

/// <summary>
/// Client interface for MSSP (MUD Server Status Protocol) operations.
/// </summary>
public interface IMsspClient
{
    /// <summary>
    /// Gets the status of a MUD server using MSSP protocol.
    /// </summary>
    /// <param name="host">The hostname or IP address of the MUD server.</param>
    /// <param name="port">The port number of the MUD server.</param>
    /// <param name="timeoutSeconds">Connection timeout in seconds (default 10).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>MsspData if successful, null if server doesn't support MSSP or connection failed.</returns>
    Task<MsspStatusResult> GetStatusAsync(
        string host,
        int port,
        int timeoutSeconds = 10,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a server is reachable via TCP (fallback for non-MSSP servers).
    /// </summary>
    /// <param name="host">The hostname or IP address.</param>
    /// <param name="port">The port number.</param>
    /// <param name="timeoutSeconds">Connection timeout in seconds.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if connection succeeded, false otherwise.</returns>
    Task<bool> CheckTcpConnectionAsync(
        string host,
        int port,
        int timeoutSeconds = 10,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of an MSSP status check.
/// </summary>
public record MsspStatusResult(
    bool IsOnline,
    MsspData? Data,
    string? ErrorMessage = null
)
{
    public static MsspStatusResult Online(MsspData data) => new(true, data);
    public static MsspStatusResult OnlineNoMssp() => new(true, null);
    public static MsspStatusResult Offline(string? error = null) => new(false, null, error);
}
