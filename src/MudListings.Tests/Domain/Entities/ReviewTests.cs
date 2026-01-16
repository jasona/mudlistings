using FluentAssertions;
using MudListings.Domain.Entities;

namespace MudListings.Tests.Domain.Entities;

public class ReviewTests
{
    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    [InlineData(4)]
    [InlineData(5)]
    public void IsValidRating_WithValidRating_ShouldReturnTrue(int rating)
    {
        // Arrange
        var review = new Review { Rating = rating };

        // Act
        var isValid = review.IsValidRating();

        // Assert
        isValid.Should().BeTrue();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(6)]
    [InlineData(10)]
    public void IsValidRating_WithInvalidRating_ShouldReturnFalse(int rating)
    {
        // Arrange
        var review = new Review { Rating = rating };

        // Act
        var isValid = review.IsValidRating();

        // Assert
        isValid.Should().BeFalse();
    }

    [Fact]
    public void NewReview_ShouldHaveDefaultValues()
    {
        // Arrange & Act
        var review = new Review();

        // Assert
        review.Id.Should().Be(Guid.Empty);
        review.MudId.Should().Be(Guid.Empty);
        review.UserId.Should().Be(Guid.Empty);
        review.Rating.Should().Be(0);
        review.Title.Should().BeNull();
        review.Body.Should().BeEmpty();
        review.HelpfulCount.Should().Be(0);
        review.IsDeleted.Should().BeFalse();
    }

    [Fact]
    public void Review_ShouldHaveNavigationCollectionsInitialized()
    {
        // Arrange & Act
        var review = new Review();

        // Assert
        review.HelpfulVotes.Should().NotBeNull().And.BeEmpty();
        review.Reports.Should().NotBeNull().And.BeEmpty();
        review.AdminReply.Should().BeNull();
    }

    [Fact]
    public void Review_ShouldInheritFromSoftDeleteEntity()
    {
        // Arrange & Act
        var review = new Review();

        // Assert
        review.IsDeleted.Should().BeFalse();
        review.DeletedAt.Should().BeNull();
        review.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        review.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }
}
