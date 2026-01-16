using FluentAssertions;
using Moq;
using MudListings.Application.DTOs.Reviews;
using MudListings.Application.Interfaces;
using MudListings.Application.Reviews.Commands;
using MudListings.Domain.Entities;

namespace MudListings.Tests.Application.Reviews.Commands;

public class CreateReviewCommandHandlerTests
{
    private readonly Mock<IReviewRepository> _reviewRepositoryMock;
    private readonly Mock<IMudRepository> _mudRepositoryMock;
    private readonly CreateReviewCommandHandler _handler;

    public CreateReviewCommandHandlerTests()
    {
        _reviewRepositoryMock = new Mock<IReviewRepository>();
        _mudRepositoryMock = new Mock<IMudRepository>();
        _handler = new CreateReviewCommandHandler(_reviewRepositoryMock.Object, _mudRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WhenMudExistsAndUserHasNotReviewed_ShouldCreateReview()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var mud = new Mud { Id = mudId, Name = "Test MUD" };

        _mudRepositoryMock
            .Setup(r => r.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);

        _reviewRepositoryMock
            .Setup(r => r.UserHasReviewedMudAsync(userId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _reviewRepositoryMock
            .Setup(r => r.CreateAsync(It.IsAny<Review>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Review r, CancellationToken _) => r);

        _reviewRepositoryMock
            .Setup(r => r.GetAggregateRatingAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((4.0, 1));

        _reviewRepositoryMock
            .Setup(r => r.GetDetailByIdAsync(It.IsAny<Guid>(), userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ReviewDto(
                Guid.NewGuid(), mudId, "Test MUD", "test-mud",
                new ReviewUserDto(userId, "TestUser", null),
                4, "Great!", "This is great", 0, false, null,
                DateTime.UtcNow, DateTime.UtcNow));

        var command = new CreateReviewCommand(mudId, userId, 4, "Great!", "This is great");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Rating.Should().Be(4);
        _reviewRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Review>(), It.IsAny<CancellationToken>()), Times.Once);
        _mudRepositoryMock.Verify(r => r.UpdateRatingAsync(mudId, 4.0, 1, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenMudDoesNotExist_ShouldReturnNull()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _mudRepositoryMock
            .Setup(r => r.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Mud?)null);

        var command = new CreateReviewCommand(mudId, userId, 4, "Great!", "This is great");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeNull();
        _reviewRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Review>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenUserHasAlreadyReviewed_ShouldReturnNull()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var mud = new Mud { Id = mudId, Name = "Test MUD" };

        _mudRepositoryMock
            .Setup(r => r.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);

        _reviewRepositoryMock
            .Setup(r => r.UserHasReviewedMudAsync(userId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var command = new CreateReviewCommand(mudId, userId, 4, "Great!", "This is great");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeNull();
        _reviewRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Review>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Theory]
    [InlineData(0, 1)]
    [InlineData(6, 5)]
    [InlineData(-1, 1)]
    [InlineData(100, 5)]
    public async Task Handle_ShouldClampRatingBetween1And5(int inputRating, int expectedRating)
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var mud = new Mud { Id = mudId, Name = "Test MUD" };
        Review? capturedReview = null;

        _mudRepositoryMock
            .Setup(r => r.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);

        _reviewRepositoryMock
            .Setup(r => r.UserHasReviewedMudAsync(userId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _reviewRepositoryMock
            .Setup(r => r.CreateAsync(It.IsAny<Review>(), It.IsAny<CancellationToken>()))
            .Callback<Review, CancellationToken>((r, _) => capturedReview = r)
            .ReturnsAsync((Review r, CancellationToken _) => r);

        _reviewRepositoryMock
            .Setup(r => r.GetAggregateRatingAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((expectedRating * 1.0, 1));

        _reviewRepositoryMock
            .Setup(r => r.GetDetailByIdAsync(It.IsAny<Guid>(), userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ReviewDto(
                Guid.NewGuid(), mudId, "Test MUD", "test-mud",
                new ReviewUserDto(userId, "TestUser", null),
                expectedRating, null, "Body", 0, false, null,
                DateTime.UtcNow, DateTime.UtcNow));

        var command = new CreateReviewCommand(mudId, userId, inputRating, null, "Body");

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedReview.Should().NotBeNull();
        capturedReview!.Rating.Should().Be(expectedRating);
    }
}
