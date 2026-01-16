namespace MudListings.Domain.ValueObjects;

/// <summary>
/// Value object representing aggregate rating data with calculation logic.
/// </summary>
public record Rating
{
    public double Average { get; init; }
    public int Count { get; init; }

    public Rating() { }

    public Rating(double average, int count)
    {
        Average = Math.Round(average, 2);
        Count = count;
    }

    /// <summary>
    /// Calculates a new rating after adding a new score.
    /// </summary>
    public Rating AddRating(int newScore)
    {
        if (newScore < 1 || newScore > 5)
            throw new ArgumentOutOfRangeException(nameof(newScore), "Rating must be between 1 and 5");

        var newCount = Count + 1;
        var newAverage = ((Average * Count) + newScore) / newCount;
        return new Rating(newAverage, newCount);
    }

    /// <summary>
    /// Calculates a new rating after updating an existing score.
    /// </summary>
    public Rating UpdateRating(int oldScore, int newScore)
    {
        if (oldScore < 1 || oldScore > 5)
            throw new ArgumentOutOfRangeException(nameof(oldScore), "Rating must be between 1 and 5");
        if (newScore < 1 || newScore > 5)
            throw new ArgumentOutOfRangeException(nameof(newScore), "Rating must be between 1 and 5");
        if (Count == 0)
            throw new InvalidOperationException("Cannot update rating when count is zero");

        var totalSum = Average * Count;
        var newSum = totalSum - oldScore + newScore;
        var newAverage = newSum / Count;
        return new Rating(newAverage, Count);
    }

    /// <summary>
    /// Calculates a new rating after removing a score.
    /// </summary>
    public Rating RemoveRating(int removedScore)
    {
        if (removedScore < 1 || removedScore > 5)
            throw new ArgumentOutOfRangeException(nameof(removedScore), "Rating must be between 1 and 5");
        if (Count == 0)
            throw new InvalidOperationException("Cannot remove rating when count is zero");

        var newCount = Count - 1;
        if (newCount == 0)
            return new Rating(0, 0);

        var totalSum = Average * Count;
        var newSum = totalSum - removedScore;
        var newAverage = newSum / newCount;
        return new Rating(newAverage, newCount);
    }

    /// <summary>
    /// Recalculates rating from a list of scores.
    /// </summary>
    public static Rating FromScores(IEnumerable<int> scores)
    {
        var scoreList = scores.ToList();
        if (scoreList.Count == 0)
            return new Rating(0, 0);

        var average = scoreList.Average();
        return new Rating(average, scoreList.Count);
    }
}
