using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MudListings.Application.Interfaces;

namespace MudListings.Infrastructure.Services;

public class TrendingUpdateSettings
{
    public const string SectionName = "TrendingUpdate";

    /// <summary>
    /// Interval in minutes between trending score updates. Default: 60 minutes.
    /// </summary>
    public int IntervalMinutes { get; set; } = 60;

    /// <summary>
    /// Whether trending updates are enabled.
    /// </summary>
    public bool Enabled { get; set; } = true;
}

public class TrendingUpdateService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TrendingUpdateService> _logger;
    private readonly TrendingUpdateSettings _settings;

    public TrendingUpdateService(
        IServiceProvider serviceProvider,
        ILogger<TrendingUpdateService> logger,
        IOptions<TrendingUpdateSettings> settings)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _settings = settings.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_settings.Enabled)
        {
            _logger.LogInformation("Trending update service is disabled");
            return;
        }

        _logger.LogInformation("Trending update service started with {Interval} minute interval",
            _settings.IntervalMinutes);

        // Initial delay to let the app start up
        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await UpdateTrendingScores(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during trending score update");
            }

            await Task.Delay(TimeSpan.FromMinutes(_settings.IntervalMinutes), stoppingToken);
        }
    }

    private async Task UpdateTrendingScores(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var trendingService = scope.ServiceProvider.GetRequiredService<ITrendingService>();

        await trendingService.UpdateAllTrendingScoresAsync(cancellationToken);
    }
}
