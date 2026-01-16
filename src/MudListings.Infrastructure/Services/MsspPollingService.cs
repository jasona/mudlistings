using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;
using MudListings.Infrastructure.Data;

namespace MudListings.Infrastructure.Services;

/// <summary>
/// Background service that polls MUD servers for MSSP status.
/// </summary>
public class MsspPollingService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MsspPollingService> _logger;
    private readonly MsspPollingSettings _settings;

    public MsspPollingService(
        IServiceProvider serviceProvider,
        ILogger<MsspPollingService> logger,
        IOptions<MsspPollingSettings> settings)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _settings = settings.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("MSSP Polling Service started. Interval: {Interval} minutes, Concurrency: {Concurrency}",
            _settings.PollingIntervalMinutes, _settings.MaxConcurrentPolls);

        // Initial delay to let the application start up
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await PollAllMudsAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // Normal shutdown
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during MSSP polling cycle");
            }

            // Wait for next polling interval
            await Task.Delay(TimeSpan.FromMinutes(_settings.PollingIntervalMinutes), stoppingToken);
        }

        _logger.LogInformation("MSSP Polling Service stopped");
    }

    private async Task PollAllMudsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var msspClient = scope.ServiceProvider.GetRequiredService<IMsspClient>();

        // Get all MUDs that have connection info
        var mudsToCheck = await context.Muds
            .Where(m => !m.IsDeleted &&
                        !string.IsNullOrEmpty(m.Connection.Host) &&
                        m.Connection.Port > 0)
            .Select(m => new
            {
                m.Id,
                m.Name,
                m.Connection.Host,
                m.Connection.Port,
                m.ConsecutiveFailures
            })
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Starting MSSP poll for {Count} MUDs", mudsToCheck.Count);

        var startTime = DateTime.UtcNow;
        var successCount = 0;
        var failureCount = 0;

        // Use semaphore for concurrency control
        using var semaphore = new SemaphoreSlim(_settings.MaxConcurrentPolls);

        var tasks = mudsToCheck.Select(async mud =>
        {
            await semaphore.WaitAsync(cancellationToken);
            try
            {
                var result = await PollSingleMudAsync(
                    scope.ServiceProvider,
                    mud.Id,
                    mud.Name,
                    mud.Host,
                    mud.Port,
                    cancellationToken);

                if (result)
                    Interlocked.Increment(ref successCount);
                else
                    Interlocked.Increment(ref failureCount);
            }
            finally
            {
                semaphore.Release();
            }
        });

        await Task.WhenAll(tasks);

        var duration = DateTime.UtcNow - startTime;
        _logger.LogInformation(
            "MSSP polling complete. Success: {Success}, Failures: {Failures}, Duration: {Duration:F1}s",
            successCount, failureCount, duration.TotalSeconds);
    }

    private async Task<bool> PollSingleMudAsync(
        IServiceProvider serviceProvider,
        Guid mudId,
        string mudName,
        string host,
        int port,
        CancellationToken cancellationToken)
    {
        var msspClient = serviceProvider.GetRequiredService<IMsspClient>();

        try
        {
            var result = await msspClient.GetStatusAsync(
                host,
                port,
                _settings.ConnectionTimeoutSeconds,
                cancellationToken);

            // Get a fresh DbContext for this update
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var mud = await context.Muds.FindAsync([mudId], cancellationToken);
            if (mud == null)
            {
                return false;
            }

            if (result.IsOnline)
            {
                if (result.Data != null)
                {
                    mud.UpdateFromMssp(result.Data);
                    _logger.LogDebug("MSSP update for {Name}: {Players} players online", mudName, result.Data.Players);
                }
                else
                {
                    // Server is online but doesn't support MSSP
                    mud.IsOnline = true;
                    mud.LastOnlineCheck = DateTime.UtcNow;
                    mud.ConsecutiveFailures = 0;
                }

                // Store status snapshot for history
                await StoreStatusSnapshotAsync(context, mud, cancellationToken);
            }
            else
            {
                mud.RecordFailure();
                _logger.LogDebug("Connection failed for {Name}: {Error}. Consecutive failures: {Failures}",
                    mudName, result.ErrorMessage, mud.ConsecutiveFailures);
            }

            await context.SaveChangesAsync(cancellationToken);
            return result.IsOnline;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error polling {Name} ({Host}:{Port})", mudName, host, port);
            return false;
        }
    }

    private static async Task StoreStatusSnapshotAsync(
        AppDbContext context,
        Mud mud,
        CancellationToken cancellationToken)
    {
        var snapshot = new MudStatus
        {
            Id = Guid.NewGuid(),
            MudId = mud.Id,
            IsOnline = mud.IsOnline,
            PlayerCount = mud.CurrentMsspData?.Players,
            CheckedAt = DateTime.UtcNow,
            MsspDataJson = mud.CurrentMsspData != null
                ? System.Text.Json.JsonSerializer.Serialize(mud.CurrentMsspData)
                : null
        };

        context.MudStatuses.Add(snapshot);

        // Clean up old snapshots (keep last 24 hours of detailed data, then hourly for 7 days)
        var cutoffDetailed = DateTime.UtcNow.AddHours(-24);
        var cutoffWeekly = DateTime.UtcNow.AddDays(-7);

        var oldSnapshots = await context.MudStatuses
            .Where(s => s.MudId == mud.Id && s.CheckedAt < cutoffWeekly)
            .ToListAsync(cancellationToken);

        context.MudStatuses.RemoveRange(oldSnapshots);
    }
}

/// <summary>
/// Settings for the MSSP polling service.
/// </summary>
public class MsspPollingSettings
{
    public const string SectionName = "MsspPolling";

    /// <summary>
    /// Interval between polling cycles in minutes. Default: 5.
    /// </summary>
    public int PollingIntervalMinutes { get; set; } = 5;

    /// <summary>
    /// Maximum number of concurrent polls. Default: 10.
    /// </summary>
    public int MaxConcurrentPolls { get; set; } = 10;

    /// <summary>
    /// Connection timeout in seconds. Default: 10.
    /// </summary>
    public int ConnectionTimeoutSeconds { get; set; } = 10;

    /// <summary>
    /// Number of consecutive failures before marking a MUD as offline. Default: 3.
    /// </summary>
    public int MaxConsecutiveFailures { get; set; } = 3;
}
