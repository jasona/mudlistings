using FluentAssertions;
using Moq;
using MudListings.Application.DTOs.Reviews;
using MudListings.Application.Interfaces;
using MudListings.Application.Reviews.Commands;
using MudListings.Domain.Entities;

namespace MudListings.Tests.Application.Reviews.Commands;

public class UpdateReviewCommandHandlerTests
{
    private readonly Mock<IReviewRepository> _reviewRepositoryMock;
    private readonly Mock<IMudRepository> _mudRepositoryMock;
    private readonly UpdateReviewCommandHandler _handler;

    public UpdateReviewCommandHandlerTests()
    {
        _reviewRepositoryMock = new Mock<IReviewRepository>();
        _mudRepositoryMock = new Mock<IMudRepository>();
        _handler = new UpdateReviewCommandHandler(_reviewRepositoryMock.Object, _mudRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WhenReviewExistsAndUserOwnsIt_ShouldUpdateReview()
    {
        // Arrange
        var reviewId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var mudId = Guid.NewGuid();
        var review = new Review { Id = reviewId, UserId = userId, MudId = mudId, Rating = 3 };

        _reviewRepositoryMock
            .Setup(r => r.GetByIdAsync(reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(review);

        _reviewRepositoryMock
            .Setup(r => r.GetAggregateRatingAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((4.5, 2));

        _reviewRepositoryMock
            .Setup(r => r.GetDetailByIdAsync(reviewId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ReviewDto(
                reviewId, mudId, "Test MUD", "test-mud",
                new ReviewUserDto(userId, "TestUser", null),
                5, "Updated", "Updated body", 0, false, null,
                DateTime.UtcNow, DateTime.UtcNow));

        var command = new UpdateReviewCommand(reviewId, userId, 5, "Updated", "Updated body");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Rating.Should().Be(5);
        _reviewRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Review>(), It.IsAny<CancellationToken>()), Times.Once);
        _mudRepositoryMock.Verify(r => r.UpdateRatingAsync(mudId, 4.5, 2, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenReviewDoesNotExist_ShouldReturnNull()
    {
        // Arrange
        var reviewId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _reviewRepositoryMock
            .Setup(r => r.GetByIdAsync(reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Review?)null);

        var command = new UpdateReviewCommand(reviewId, userId, 5, "Updated", "Updated body");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeNull();
        _reviewRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Review>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenUserDoesNotOwnReview_ShouldReturnNull()
    {
        // Arrange
        var reviewId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var differentUserId = Guid.NewGuid();
        var review = new Review { Id = reviewId, UserId = differentUserId };

        _reviewRepositoryMock
            .Setup(r => r.GetByIdAsync(reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(review);

        var command = new UpdateReviewCommand(reviewId, userId, 5, "Updated", "Updated body");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeNull();
        _reviewRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Review>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
