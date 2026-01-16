using System.Net.Sockets;
using System.Text;
using Microsoft.Extensions.Logging;
using MudListings.Application.Interfaces;
using MudListings.Domain.ValueObjects;

namespace MudListings.Infrastructure.Services;

/// <summary>
/// MSSP (MUD Server Status Protocol) client implementation.
/// Protocol specification: http://tintin.mudhalla.net/protocols/mssp/
/// </summary>
public class MsspClient : IMsspClient
{
    private readonly ILogger<MsspClient> _logger;

    // Telnet protocol constants
    private const byte IAC = 255;  // Interpret As Command
    private const byte WILL = 251;
    private const byte WONT = 252;
    private const byte DO = 253;
    private const byte DONT = 254;
    private const byte SB = 250;   // Subnegotiation Begin
    private const byte SE = 240;   // Subnegotiation End
    private const byte MSSP = 70;  // MSSP option code

    // MSSP subnegotiation constants
    private const byte MSSP_VAR = 1;
    private const byte MSSP_VAL = 2;

    public MsspClient(ILogger<MsspClient> logger)
    {
        _logger = logger;
    }

    public async Task<MsspStatusResult> GetStatusAsync(
        string host,
        int port,
        int timeoutSeconds = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var client = new TcpClient();
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

            _logger.LogDebug("Connecting to {Host}:{Port} for MSSP check", host, port);

            await client.ConnectAsync(host, port, cts.Token);

            if (!client.Connected)
            {
                return MsspStatusResult.Offline("Failed to connect");
            }

            using var stream = client.GetStream();
            stream.ReadTimeout = timeoutSeconds * 1000;
            stream.WriteTimeout = timeoutSeconds * 1000;

            // Send MSSP request: IAC DO MSSP
            var msspRequest = new byte[] { IAC, DO, MSSP };
            await stream.WriteAsync(msspRequest, cts.Token);
            await stream.FlushAsync(cts.Token);

            // Read response with timeout
            var response = await ReadResponseAsync(stream, timeoutSeconds, cts.Token);

            if (response == null || response.Length == 0)
            {
                _logger.LogDebug("No response from {Host}:{Port}, server is online but no MSSP", host, port);
                return MsspStatusResult.OnlineNoMssp();
            }

            // Parse MSSP data from response
            var msspData = ParseMsspResponse(response);

            if (msspData != null)
            {
                _logger.LogDebug("MSSP data received from {Host}:{Port}: {Players} players",
                    host, port, msspData.Players);
                return MsspStatusResult.Online(msspData);
            }

            // Server responded but no MSSP data found
            _logger.LogDebug("Server {Host}:{Port} is online but doesn't support MSSP", host, port);
            return MsspStatusResult.OnlineNoMssp();
        }
        catch (OperationCanceledException)
        {
            _logger.LogDebug("Connection to {Host}:{Port} timed out", host, port);
            return MsspStatusResult.Offline("Connection timed out");
        }
        catch (SocketException ex)
        {
            _logger.LogDebug("Socket error connecting to {Host}:{Port}: {Message}", host, port, ex.Message);
            return MsspStatusResult.Offline($"Socket error: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error checking MSSP status for {Host}:{Port}", host, port);
            return MsspStatusResult.Offline($"Error: {ex.Message}");
        }
    }

    public async Task<bool> CheckTcpConnectionAsync(
        string host,
        int port,
        int timeoutSeconds = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var client = new TcpClient();
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

            await client.ConnectAsync(host, port, cts.Token);
            return client.Connected;
        }
        catch (Exception ex)
        {
            _logger.LogDebug("TCP connection check failed for {Host}:{Port}: {Message}", host, port, ex.Message);
            return false;
        }
    }

    private async Task<byte[]?> ReadResponseAsync(
        NetworkStream stream,
        int timeoutSeconds,
        CancellationToken cancellationToken)
    {
        var buffer = new byte[4096];
        var responseBuffer = new List<byte>();
        var readStartTime = DateTime.UtcNow;
        var maxReadTime = TimeSpan.FromSeconds(Math.Min(timeoutSeconds, 5)); // Max 5 seconds for reading

        try
        {
            while (DateTime.UtcNow - readStartTime < maxReadTime)
            {
                if (stream.DataAvailable)
                {
                    var bytesRead = await stream.ReadAsync(buffer.AsMemory(0, buffer.Length), cancellationToken);
                    if (bytesRead > 0)
                    {
                        responseBuffer.AddRange(buffer.Take(bytesRead));

                        // Check if we've received complete MSSP data
                        if (ContainsMsspEnd(responseBuffer))
                        {
                            break;
                        }
                    }
                }
                else
                {
                    // Wait a bit before checking again
                    await Task.Delay(50, cancellationToken);
                }

                // If we have some data and nothing new is coming, break
                if (responseBuffer.Count > 0 && !stream.DataAvailable)
                {
                    await Task.Delay(100, cancellationToken); // Give a bit more time
                    if (!stream.DataAvailable)
                    {
                        break;
                    }
                }
            }
        }
        catch (OperationCanceledException)
        {
            // Timeout or cancellation
        }

        return responseBuffer.Count > 0 ? responseBuffer.ToArray() : null;
    }

    private static bool ContainsMsspEnd(List<byte> buffer)
    {
        // Look for IAC SE (end of subnegotiation)
        for (int i = 0; i < buffer.Count - 1; i++)
        {
            if (buffer[i] == IAC && buffer[i + 1] == SE)
            {
                return true;
            }
        }
        return false;
    }

    private MsspData? ParseMsspResponse(byte[] response)
    {
        // Look for MSSP subnegotiation in the response
        // Format: IAC SB MSSP MSSP_VAR <var> MSSP_VAL <val> ... IAC SE

        int msspStart = -1;
        int msspEnd = -1;

        // Find MSSP subnegotiation start: IAC SB MSSP
        for (int i = 0; i < response.Length - 2; i++)
        {
            if (response[i] == IAC && response[i + 1] == SB && response[i + 2] == MSSP)
            {
                msspStart = i + 3;
                break;
            }
        }

        if (msspStart < 0)
        {
            // Check if server sent WILL MSSP or WONT MSSP
            for (int i = 0; i < response.Length - 2; i++)
            {
                if (response[i] == IAC && response[i + 1] == WONT && response[i + 2] == MSSP)
                {
                    _logger.LogDebug("Server responded with WONT MSSP");
                    return null;
                }
            }
            return null;
        }

        // Find MSSP subnegotiation end: IAC SE
        for (int i = msspStart; i < response.Length - 1; i++)
        {
            if (response[i] == IAC && response[i + 1] == SE)
            {
                msspEnd = i;
                break;
            }
        }

        if (msspEnd < 0)
        {
            _logger.LogDebug("MSSP subnegotiation not properly terminated");
            return null;
        }

        // Parse MSSP variables
        var msspBytes = response[msspStart..msspEnd];
        var variables = ParseMsspVariables(msspBytes);

        if (variables.Count == 0)
        {
            return null;
        }

        return MsspData.Parse(variables);
    }

    private Dictionary<string, string> ParseMsspVariables(byte[] data)
    {
        var variables = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var currentVar = new List<byte>();
        var currentVal = new List<byte>();
        bool readingVar = false;
        bool readingVal = false;
        string? lastName = null;

        for (int i = 0; i < data.Length; i++)
        {
            byte b = data[i];

            if (b == MSSP_VAR)
            {
                // Save previous variable if exists
                if (lastName != null && currentVal.Count > 0)
                {
                    var value = Encoding.UTF8.GetString(currentVal.ToArray());
                    variables[lastName] = value;
                }

                currentVar.Clear();
                currentVal.Clear();
                readingVar = true;
                readingVal = false;
            }
            else if (b == MSSP_VAL)
            {
                if (readingVar && currentVar.Count > 0)
                {
                    lastName = Encoding.UTF8.GetString(currentVar.ToArray());
                }
                currentVal.Clear();
                readingVar = false;
                readingVal = true;
            }
            else if (b == IAC)
            {
                // End of MSSP data
                break;
            }
            else
            {
                if (readingVar)
                {
                    currentVar.Add(b);
                }
                else if (readingVal)
                {
                    currentVal.Add(b);
                }
            }
        }

        // Save last variable
        if (lastName != null && currentVal.Count > 0)
        {
            var value = Encoding.UTF8.GetString(currentVal.ToArray());
            variables[lastName] = value;
        }

        _logger.LogDebug("Parsed {Count} MSSP variables", variables.Count);
        return variables;
    }
}
