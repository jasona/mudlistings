namespace MudListings.Domain.ValueObjects;

/// <summary>
/// Value object representing MUD connection details.
/// </summary>
public record ConnectionInfo
{
    public string Host { get; init; } = string.Empty;
    public int Port { get; init; }
    public string? WebClientUrl { get; init; }

    public ConnectionInfo() { }

    public ConnectionInfo(string host, int port, string? webClientUrl = null)
    {
        Host = host;
        Port = port;
        WebClientUrl = webClientUrl;
    }

    /// <summary>
    /// Returns the telnet connection string (host:port).
    /// </summary>
    public string ToConnectionString() => $"{Host}:{Port}";
}
