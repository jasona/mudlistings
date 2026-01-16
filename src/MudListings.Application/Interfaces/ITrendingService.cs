namespace MudListings.Application.Interfaces;

/// <summary>
/// Service interface for calculating and updating trending scores.
/// </summary>
public interface ITrendingService
{
    /// <summary>
    /// Calculates the trending score for a single MUD.
    /// </summary>
    Task<double> CalculateTrendingScoreAsync(Guid mudId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates trending scores for all MUDs.
    /// </summary>
    Task UpdateAllTrendingScoresAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates the trending score for a specific MUD.
    /// </summary>
    Task UpdateTrendingScoreAsync(Guid mudId, CancellationToken cancellationToken = default);
}
