using FluentAssertions;
using MudListings.Domain.Entities;
using MudListings.Domain.ValueObjects;

namespace MudListings.Tests.Domain.Entities;

public class MudTests
{
    [Theory]
    [InlineData("Test MUD", "test-mud")]
    [InlineData("The Awesome Game", "the-awesome-game")]
    [InlineData("MUD'S Best", "muds-best")]
    [InlineData("Rock & Roll", "rock-and-roll")]
    [InlineData("Some \"Quoted\" Name", "some-quoted-name")]
    public void GenerateSlug_ShouldCreateUrlFriendlySlug(string name, string expectedSlug)
    {
        // Act
        var slug = Mud.GenerateSlug(name);

        // Assert
        slug.Should().Be(expectedSlug);
    }

    [Fact]
    public void MarkOffline_ShouldSetIsOnlineToFalseAndUpdateLastOnlineCheck()
    {
        // Arrange
        var mud = new Mud
        {
            IsOnline = true,
            LastOnlineCheck = DateTime.UtcNow.AddMinutes(-10)
        };
        var beforeMark = DateTime.UtcNow;

        // Act
        mud.MarkOffline();

        // Assert
        mud.IsOnline.Should().BeFalse();
        mud.LastOnlineCheck.Should().BeOnOrAfter(beforeMark);
    }

    [Fact]
    public void UpdateFromMssp_ShouldSetOnlineAndResetFailures()
    {
        // Arrange
        var mud = new Mud
        {
            IsOnline = false,
            ConsecutiveFailures = 5,
            CurrentMsspData = null
        };
        var msspData = new MsspData
        {
            GameName = "Test MUD",
            Players = 42
        };
        var beforeUpdate = DateTime.UtcNow;

        // Act
        mud.UpdateFromMssp(msspData);

        // Assert
        mud.IsOnline.Should().BeTrue();
        mud.ConsecutiveFailures.Should().Be(0);
        mud.CurrentMsspData.Should().Be(msspData);
        mud.LastOnlineCheck.Should().BeOnOrAfter(beforeUpdate);
    }

    [Fact]
    public void RecordFailure_ShouldIncrementConsecutiveFailures()
    {
        // Arrange
        var mud = new Mud
        {
            IsOnline = true,
            ConsecutiveFailures = 0
        };

        // Act
        mud.RecordFailure();

        // Assert
        mud.ConsecutiveFailures.Should().Be(1);
        mud.IsOnline.Should().BeTrue(); // Should still be online after 1 failure
    }

    [Fact]
    public void RecordFailure_AfterThreeConsecutiveFailures_ShouldMarkOffline()
    {
        // Arrange
        var mud = new Mud
        {
            IsOnline = true,
            ConsecutiveFailures = 2
        };

        // Act
        mud.RecordFailure();

        // Assert
        mud.ConsecutiveFailures.Should().Be(3);
        mud.IsOnline.Should().BeFalse();
    }

    [Fact]
    public void RecordFailure_ShouldUpdateLastOnlineCheck()
    {
        // Arrange
        var mud = new Mud
        {
            LastOnlineCheck = DateTime.UtcNow.AddMinutes(-10)
        };
        var beforeFailure = DateTime.UtcNow;

        // Act
        mud.RecordFailure();

        // Assert
        mud.LastOnlineCheck.Should().BeOnOrAfter(beforeFailure);
    }

    [Fact]
    public void NewMud_ShouldHaveDefaultValues()
    {
        // Arrange & Act
        var mud = new Mud();

        // Assert
        mud.Id.Should().Be(Guid.Empty);
        mud.Name.Should().BeEmpty();
        mud.Slug.Should().BeEmpty();
        mud.Description.Should().BeEmpty();
        mud.IsOnline.Should().BeFalse();
        mud.ConsecutiveFailures.Should().Be(0);
        mud.IsFeatured.Should().BeFalse();
        mud.TrendingScore.Should().Be(0);
        mud.ViewCount.Should().Be(0);
        mud.FavoriteCount.Should().Be(0);
        mud.IsDeleted.Should().BeFalse();
        mud.Connection.Should().NotBeNull();
        mud.AggregateRating.Should().NotBeNull();
        mud.AggregateRating.Average.Should().Be(0);
        mud.AggregateRating.Count.Should().Be(0);
    }

    [Fact]
    public void Mud_ShouldHaveNavigationCollectionsInitialized()
    {
        // Arrange & Act
        var mud = new Mud();

        // Assert
        mud.MudGenres.Should().NotBeNull().And.BeEmpty();
        mud.Reviews.Should().NotBeNull().And.BeEmpty();
        mud.Favorites.Should().NotBeNull().And.BeEmpty();
        mud.Admins.Should().NotBeNull().And.BeEmpty();
        mud.StatusHistory.Should().NotBeNull().And.BeEmpty();
        mud.ActivityEvents.Should().NotBeNull().And.BeEmpty();
    }
}
