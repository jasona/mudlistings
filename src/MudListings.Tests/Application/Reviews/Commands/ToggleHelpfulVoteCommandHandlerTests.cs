using FluentAssertions;
using Moq;
using MudListings.Application.Interfaces;
using MudListings.Application.Reviews.Commands;
using MudListings.Domain.Entities;

namespace MudListings.Tests.Application.Reviews.Commands;

public class ToggleHelpfulVoteCommandHandlerTests
{
    private readonly Mock<IReviewRepository> _reviewRepositoryMock;
    private readonly ToggleHelpfulVoteCommandHandler _handler;

    public ToggleHelpfulVoteCommandHandlerTests()
    {
        _reviewRepositoryMock = new Mock<IReviewRepository>();
        _handler = new ToggleHelpfulVoteCommandHandler(_reviewRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WhenUserHasNotVoted_ShouldAddVote()
    {
        // Arrange
        var reviewId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var reviewUserId = Guid.NewGuid();
        var review = new Review { Id = reviewId, UserId = reviewUserId, HelpfulCount = 5 };

        _reviewRepositoryMock
            .Setup(r => r.GetByIdAsync(reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(review);

        _reviewRepositoryMock
            .Setup(r => r.HasUserVotedHelpfulAsync(userId, reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _reviewRepositoryMock
            .SetupSequence(r => r.GetByIdAsync(reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(review)
            .ReturnsAsync(new Review { Id = reviewId, UserId = reviewUserId, HelpfulCount = 6 });

        var command = new ToggleHelpfulVoteCommand(reviewId, userId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsNowHelpful.Should().BeTrue();
        _reviewRepositoryMock.Verify(r => r.AddHelpfulVoteAsync(userId, reviewId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenUserHasVoted_ShouldRemoveVote()
    {
        // Arrange
        var reviewId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var reviewUserId = Guid.NewGuid();
        var review = new Review { Id = reviewId, UserId = reviewUserId, HelpfulCount = 5 };

        _reviewRepositoryMock
            .SetupSequence(r => r.GetByIdAsync(reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(review)
            .ReturnsAsync(new Review { Id = reviewId, UserId = reviewUserId, HelpfulCount = 4 });

        _reviewRepositoryMock
            .Setup(r => r.HasUserVotedHelpfulAsync(userId, reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var command = new ToggleHelpfulVoteCommand(reviewId, userId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsNowHelpful.Should().BeFalse();
        _reviewRepositoryMock.Verify(r => r.RemoveHelpfulVoteAsync(userId, reviewId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenReviewNotFound_ShouldThrow()
    {
        // Arrange
        var reviewId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _reviewRepositoryMock
            .Setup(r => r.GetByIdAsync(reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Review?)null);

        var command = new ToggleHelpfulVoteCommand(reviewId, userId);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenUserVotesOwnReview_ShouldThrow()
    {
        // Arrange
        var reviewId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var review = new Review { Id = reviewId, UserId = userId };

        _reviewRepositoryMock
            .Setup(r => r.GetByIdAsync(reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(review);

        var command = new ToggleHelpfulVoteCommand(reviewId, userId);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _handler.Handle(command, CancellationToken.None));
    }
}
