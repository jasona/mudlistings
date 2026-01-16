using FluentAssertions;
using Moq;
using MudListings.Application.Interfaces;
using MudListings.Application.Reviews.Commands;
using MudListings.Domain.Entities;

namespace MudListings.Tests.Application.Reviews.Commands;

public class ReportReviewCommandHandlerTests
{
    private readonly Mock<IReviewRepository> _reviewRepositoryMock;
    private readonly ReportReviewCommandHandler _handler;

    public ReportReviewCommandHandlerTests()
    {
        _reviewRepositoryMock = new Mock<IReviewRepository>();
        _handler = new ReportReviewCommandHandler(_reviewRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WhenValidReport_ShouldCreateReportAndReturnTrue()
    {
        // Arrange
        var reviewId = Guid.NewGuid();
        var reporterId = Guid.NewGuid();
        var reviewUserId = Guid.NewGuid();
        var review = new Review { Id = reviewId, UserId = reviewUserId };

        _reviewRepositoryMock
            .Setup(r => r.GetByIdAsync(reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(review);

        _reviewRepositoryMock
            .Setup(r => r.HasUserReportedReviewAsync(reporterId, reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _reviewRepositoryMock
            .Setup(r => r.AddReportAsync(It.IsAny<ReviewReport>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ReviewReport r, CancellationToken _) => r);

        var command = new ReportReviewCommand(reviewId, reporterId, "Spam", "Contains advertising");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        _reviewRepositoryMock.Verify(r => r.AddReportAsync(
            It.Is<ReviewReport>(rr => rr.Reason == "Spam" && rr.Details == "Contains advertising"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenReviewDoesNotExist_ShouldReturnFalse()
    {
        // Arrange
        var reviewId = Guid.NewGuid();
        var reporterId = Guid.NewGuid();

        _reviewRepositoryMock
            .Setup(r => r.GetByIdAsync(reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Review?)null);

        var command = new ReportReviewCommand(reviewId, reporterId, "Spam", null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
        _reviewRepositoryMock.Verify(r => r.AddReportAsync(It.IsAny<ReviewReport>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenUserReportsOwnReview_ShouldReturnFalse()
    {
        // Arrange
        var reviewId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var review = new Review { Id = reviewId, UserId = userId };

        _reviewRepositoryMock
            .Setup(r => r.GetByIdAsync(reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(review);

        var command = new ReportReviewCommand(reviewId, userId, "Spam", null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
        _reviewRepositoryMock.Verify(r => r.AddReportAsync(It.IsAny<ReviewReport>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenUserHasAlreadyReported_ShouldReturnFalse()
    {
        // Arrange
        var reviewId = Guid.NewGuid();
        var reporterId = Guid.NewGuid();
        var reviewUserId = Guid.NewGuid();
        var review = new Review { Id = reviewId, UserId = reviewUserId };

        _reviewRepositoryMock
            .Setup(r => r.GetByIdAsync(reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(review);

        _reviewRepositoryMock
            .Setup(r => r.HasUserReportedReviewAsync(reporterId, reviewId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var command = new ReportReviewCommand(reviewId, reporterId, "Spam", null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
        _reviewRepositoryMock.Verify(r => r.AddReportAsync(It.IsAny<ReviewReport>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
