using FluentAssertions;
using Moq;
using MudListings.Application.Admin.Commands;
using MudListings.Application.DTOs.Admin;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Tests.Application.Admin;

public class ModerateContentCommandTests
{
    private readonly Mock<IAdminRepository> _adminRepositoryMock;
    private readonly Mock<IReviewRepository> _reviewRepositoryMock;
    private readonly ModerateContentCommandHandler _handler;

    public ModerateContentCommandTests()
    {
        _adminRepositoryMock = new Mock<IAdminRepository>();
        _reviewRepositoryMock = new Mock<IReviewRepository>();
        _handler = new ModerateContentCommandHandler(
            _adminRepositoryMock.Object,
            _reviewRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ApproveReport_RejectsReport()
    {
        // Arrange
        var reportId = Guid.NewGuid();
        var moderatorId = Guid.NewGuid();
        var review = new Review { Id = Guid.NewGuid() };
        var report = new ReviewReport
        {
            Id = reportId,
            Status = ReviewReportStatus.Pending,
            Review = review
        };

        _adminRepositoryMock.Setup(x => x.GetReportByIdAsync(reportId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(report);
        _adminRepositoryMock.Setup(x => x.UpdateReportAsync(It.IsAny<ReviewReport>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _adminRepositoryMock.Setup(x => x.CreateAuditLogAsync(It.IsAny<AuditLog>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new ModerateContentCommand(reportId, moderatorId, ModerationAction.Approve, "Report is invalid");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeTrue();
        report.Status.Should().Be(ReviewReportStatus.Rejected);
        report.ResolvedByUserId.Should().Be(moderatorId);
    }

    [Fact]
    public async Task Handle_HideReview_HidesReviewAndResolvesReport()
    {
        // Arrange
        var reportId = Guid.NewGuid();
        var moderatorId = Guid.NewGuid();
        var review = new Review { Id = Guid.NewGuid(), IsHidden = false };
        var report = new ReviewReport
        {
            Id = reportId,
            ReviewId = review.Id,
            Status = ReviewReportStatus.Pending,
            Review = review
        };

        _adminRepositoryMock.Setup(x => x.GetReportByIdAsync(reportId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(report);
        _adminRepositoryMock.Setup(x => x.UpdateReportAsync(It.IsAny<ReviewReport>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _adminRepositoryMock.Setup(x => x.CreateAuditLogAsync(It.IsAny<AuditLog>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _reviewRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<Review>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new ModerateContentCommand(reportId, moderatorId, ModerationAction.HideReview, "Inappropriate content");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeTrue();
        report.Status.Should().Be(ReviewReportStatus.ReviewHidden);
        review.IsHidden.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_DeleteReview_DeletesReviewAndResolvesReport()
    {
        // Arrange
        var reportId = Guid.NewGuid();
        var moderatorId = Guid.NewGuid();
        var reviewId = Guid.NewGuid();
        var review = new Review { Id = reviewId };
        var report = new ReviewReport
        {
            Id = reportId,
            ReviewId = reviewId,
            Status = ReviewReportStatus.Pending,
            Review = review
        };

        _adminRepositoryMock.Setup(x => x.GetReportByIdAsync(reportId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(report);
        _adminRepositoryMock.Setup(x => x.UpdateReportAsync(It.IsAny<ReviewReport>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _adminRepositoryMock.Setup(x => x.CreateAuditLogAsync(It.IsAny<AuditLog>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _reviewRepositoryMock.Setup(x => x.DeleteAsync(reviewId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new ModerateContentCommand(reportId, moderatorId, ModerationAction.DeleteReview, "Spam");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeTrue();
        report.Status.Should().Be(ReviewReportStatus.ReviewDeleted);
        _reviewRepositoryMock.Verify(x => x.DeleteAsync(reviewId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ReportNotFound_ReturnsFailure()
    {
        // Arrange
        var reportId = Guid.NewGuid();
        var moderatorId = Guid.NewGuid();

        _adminRepositoryMock.Setup(x => x.GetReportByIdAsync(reportId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ReviewReport?)null);

        var command = new ModerateContentCommand(reportId, moderatorId, ModerationAction.Approve, null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task Handle_AlreadyResolved_ReturnsFailure()
    {
        // Arrange
        var reportId = Guid.NewGuid();
        var moderatorId = Guid.NewGuid();
        var report = new ReviewReport
        {
            Id = reportId,
            Status = ReviewReportStatus.Approved // Already resolved
        };

        _adminRepositoryMock.Setup(x => x.GetReportByIdAsync(reportId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(report);

        var command = new ModerateContentCommand(reportId, moderatorId, ModerationAction.Approve, null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("already been resolved");
    }
}
