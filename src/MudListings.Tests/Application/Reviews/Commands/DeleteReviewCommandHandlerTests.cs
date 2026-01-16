using FluentAssertions;
using Moq;
using MudListings.Application.Interfaces;
using MudListings.Application.Reviews.Commands;
using MudListings.Domain.Entities;

namespace MudListings.Tests.Application.Reviews.Commands;

public class DeleteReviewCommandHandlerTests
{
    private readonly Mock<IReviewRepository> _reviewRepositoryMock;
    private readonly Mock<IMudRepository> _mudRepositoryMock;
    private readonly DeleteReviewCommandHandler _handler;

    public DeleteReviewCommandHandlerTests()
    {
        _reviewRepositoryMock = new Mock<IReviewRepository>();
        _mudRepositoryMock = new Mock<IMudRepository>();
        _handler = new DeleteReviewCommandHandler(_reviewRepositoryMock.Object, _mudRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WhenUserOwnsReview_ShouldDeleteAndReturnTrue()
    {
        // Arrange
        var reviewId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var mudId = Guid.NewGuid();
        var review = new Review { Id = reviewId, UserId = userId, MudId = mudId };

        _reviewRepositoryMock
            .Setup(r => r.GetByIdAsync(reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(review);

        _reviewRepositoryMock
            .Setup(r => r.GetAggregateRatingAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((0, 0));

        var command = new DeleteReviewCommand(reviewId, userId, false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        _reviewRepositoryMock.Verify(r => r.DeleteAsync(reviewId, It.IsAny<CancellationToken>()), Times.Once);
        _mudRepositoryMock.Verify(r => r.UpdateRatingAsync(mudId, 0, 0, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenAdminDeletesOtherUserReview_ShouldDeleteAndReturnTrue()
    {
        // Arrange
        var reviewId = Guid.NewGuid();
        var adminUserId = Guid.NewGuid();
        var reviewUserId = Guid.NewGuid();
        var mudId = Guid.NewGuid();
        var review = new Review { Id = reviewId, UserId = reviewUserId, MudId = mudId };

        _reviewRepositoryMock
            .Setup(r => r.GetByIdAsync(reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(review);

        _reviewRepositoryMock
            .Setup(r => r.GetAggregateRatingAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((0, 0));

        var command = new DeleteReviewCommand(reviewId, adminUserId, true); // isAdmin = true

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        _reviewRepositoryMock.Verify(r => r.DeleteAsync(reviewId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenReviewDoesNotExist_ShouldReturnFalse()
    {
        // Arrange
        var reviewId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _reviewRepositoryMock
            .Setup(r => r.GetByIdAsync(reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Review?)null);

        var command = new DeleteReviewCommand(reviewId, userId, false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
        _reviewRepositoryMock.Verify(r => r.DeleteAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenNonAdminDeletesOtherUserReview_ShouldReturnFalse()
    {
        // Arrange
        var reviewId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var differentUserId = Guid.NewGuid();
        var review = new Review { Id = reviewId, UserId = differentUserId };

        _reviewRepositoryMock
            .Setup(r => r.GetByIdAsync(reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(review);

        var command = new DeleteReviewCommand(reviewId, userId, false); // isAdmin = false

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
        _reviewRepositoryMock.Verify(r => r.DeleteAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
