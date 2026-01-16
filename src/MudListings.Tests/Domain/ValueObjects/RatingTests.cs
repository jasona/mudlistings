using FluentAssertions;
using MudListings.Domain.ValueObjects;

namespace MudListings.Tests.Domain.ValueObjects;

public class RatingTests
{
    [Fact]
    public void Constructor_WithValidValues_ShouldCreateRating()
    {
        // Arrange & Act
        var rating = new Rating(4.5, 10);

        // Assert
        rating.Average.Should().Be(4.5);
        rating.Count.Should().Be(10);
    }

    [Fact]
    public void Constructor_ShouldRoundAverageToTwoDecimalPlaces()
    {
        // Arrange & Act
        var rating = new Rating(4.567, 10);

        // Assert
        rating.Average.Should().Be(4.57);
    }

    [Fact]
    public void AddRating_WithValidScore_ShouldUpdateAverageAndCount()
    {
        // Arrange
        var rating = new Rating(4.0, 2); // Total: 8, Count: 2

        // Act
        var newRating = rating.AddRating(5);

        // Assert
        newRating.Count.Should().Be(3);
        newRating.Average.Should().BeApproximately(4.33, 0.01); // (8 + 5) / 3 = 4.33
    }

    [Fact]
    public void AddRating_ToEmptyRating_ShouldReturnNewRating()
    {
        // Arrange
        var rating = new Rating(0, 0);

        // Act
        var newRating = rating.AddRating(5);

        // Assert
        newRating.Count.Should().Be(1);
        newRating.Average.Should().Be(5.0);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    [InlineData(-1)]
    public void AddRating_WithInvalidScore_ShouldThrowArgumentOutOfRangeException(int invalidScore)
    {
        // Arrange
        var rating = new Rating(4.0, 2);

        // Act
        var act = () => rating.AddRating(invalidScore);

        // Assert
        act.Should().Throw<ArgumentOutOfRangeException>()
            .WithParameterName("newScore");
    }

    [Fact]
    public void UpdateRating_WithValidScores_ShouldUpdateAverage()
    {
        // Arrange
        var rating = new Rating(4.0, 2); // Total: 8, Count: 2

        // Act
        var newRating = rating.UpdateRating(3, 5); // Replace 3 with 5: (8 - 3 + 5) / 2 = 5

        // Assert
        newRating.Count.Should().Be(2);
        newRating.Average.Should().Be(5.0);
    }

    [Fact]
    public void UpdateRating_WithZeroCount_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var rating = new Rating(0, 0);

        // Act
        var act = () => rating.UpdateRating(3, 5);

        // Assert
        act.Should().Throw<InvalidOperationException>();
    }

    [Theory]
    [InlineData(0, 5)]
    [InlineData(6, 5)]
    [InlineData(5, 0)]
    [InlineData(5, 6)]
    public void UpdateRating_WithInvalidScores_ShouldThrowArgumentOutOfRangeException(int oldScore, int newScore)
    {
        // Arrange
        var rating = new Rating(4.0, 2);

        // Act
        var act = () => rating.UpdateRating(oldScore, newScore);

        // Assert
        act.Should().Throw<ArgumentOutOfRangeException>();
    }

    [Fact]
    public void RemoveRating_WithValidScore_ShouldUpdateAverageAndCount()
    {
        // Arrange
        var rating = new Rating(4.0, 3); // Total: 12, Count: 3

        // Act
        var newRating = rating.RemoveRating(3); // (12 - 3) / 2 = 4.5

        // Assert
        newRating.Count.Should().Be(2);
        newRating.Average.Should().Be(4.5);
    }

    [Fact]
    public void RemoveRating_WhenLastRating_ShouldReturnZeroRating()
    {
        // Arrange
        var rating = new Rating(5.0, 1);

        // Act
        var newRating = rating.RemoveRating(5);

        // Assert
        newRating.Count.Should().Be(0);
        newRating.Average.Should().Be(0);
    }

    [Fact]
    public void RemoveRating_WithZeroCount_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var rating = new Rating(0, 0);

        // Act
        var act = () => rating.RemoveRating(5);

        // Assert
        act.Should().Throw<InvalidOperationException>();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    [InlineData(-1)]
    public void RemoveRating_WithInvalidScore_ShouldThrowArgumentOutOfRangeException(int invalidScore)
    {
        // Arrange
        var rating = new Rating(4.0, 2);

        // Act
        var act = () => rating.RemoveRating(invalidScore);

        // Assert
        act.Should().Throw<ArgumentOutOfRangeException>()
            .WithParameterName("removedScore");
    }

    [Fact]
    public void FromScores_WithValidScores_ShouldCalculateCorrectRating()
    {
        // Arrange
        var scores = new[] { 5, 4, 3, 5, 3 };

        // Act
        var rating = Rating.FromScores(scores);

        // Assert
        rating.Count.Should().Be(5);
        rating.Average.Should().Be(4.0);
    }

    [Fact]
    public void FromScores_WithEmptyList_ShouldReturnZeroRating()
    {
        // Arrange
        var scores = Array.Empty<int>();

        // Act
        var rating = Rating.FromScores(scores);

        // Assert
        rating.Count.Should().Be(0);
        rating.Average.Should().Be(0);
    }

    [Fact]
    public void FromScores_WithSingleScore_ShouldReturnCorrectRating()
    {
        // Arrange
        var scores = new[] { 5 };

        // Act
        var rating = Rating.FromScores(scores);

        // Assert
        rating.Count.Should().Be(1);
        rating.Average.Should().Be(5.0);
    }
}
