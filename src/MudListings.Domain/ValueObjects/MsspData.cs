namespace MudListings.Domain.ValueObjects;

/// <summary>
/// Value object representing MSSP (MUD Server Status Protocol) response data.
/// </summary>
public record MsspData
{
    public string? GameName { get; init; }
    public int? Players { get; init; }
    public int? MaxPlayers { get; init; }
    public long? Uptime { get; init; }
    public string? Codebase { get; init; }
    public string? Contact { get; init; }
    public string? Website { get; init; }
    public string? Language { get; init; }
    public string? Location { get; init; }
    public string? Family { get; init; }
    public List<string> Protocols { get; init; } = new();
    public DateTime ReceivedAt { get; init; } = DateTime.UtcNow;

    public MsspData() { }

    /// <summary>
    /// Parses raw MSSP key-value pairs into an MsspData object.
    /// </summary>
    public static MsspData Parse(Dictionary<string, string> rawData)
    {
        return new MsspData
        {
            GameName = rawData.GetValueOrDefault("NAME"),
            Players = ParseInt(rawData.GetValueOrDefault("PLAYERS")),
            MaxPlayers = ParseInt(rawData.GetValueOrDefault("UPTIME")),
            Uptime = ParseLong(rawData.GetValueOrDefault("UPTIME")),
            Codebase = rawData.GetValueOrDefault("CODEBASE"),
            Contact = rawData.GetValueOrDefault("CONTACT"),
            Website = rawData.GetValueOrDefault("WEBSITE") ?? rawData.GetValueOrDefault("WWW"),
            Language = rawData.GetValueOrDefault("LANGUAGE"),
            Location = rawData.GetValueOrDefault("LOCATION"),
            Family = rawData.GetValueOrDefault("FAMILY"),
            Protocols = ParseProtocols(rawData),
            ReceivedAt = DateTime.UtcNow
        };
    }

    private static int? ParseInt(string? value)
        => int.TryParse(value, out var result) ? result : null;

    private static long? ParseLong(string? value)
        => long.TryParse(value, out var result) ? result : null;

    private static List<string> ParseProtocols(Dictionary<string, string> rawData)
    {
        var protocols = new List<string>();

        // Check for common protocol indicators
        if (rawData.GetValueOrDefault("ANSI") == "1") protocols.Add("ANSI");
        if (rawData.GetValueOrDefault("UTF-8") == "1") protocols.Add("UTF-8");
        if (rawData.GetValueOrDefault("MXP") == "1") protocols.Add("MXP");
        if (rawData.GetValueOrDefault("MCCP") == "1") protocols.Add("MCCP");
        if (rawData.GetValueOrDefault("MSP") == "1") protocols.Add("MSP");
        if (rawData.GetValueOrDefault("SSL") == "1") protocols.Add("SSL");

        return protocols;
    }
}
