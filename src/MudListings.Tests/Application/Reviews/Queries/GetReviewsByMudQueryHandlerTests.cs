using FluentAssertions;
using Moq;
using MudListings.Application.DTOs.Reviews;
using MudListings.Application.Interfaces;
using MudListings.Application.Reviews.Queries;

namespace MudListings.Tests.Application.Reviews.Queries;

public class GetReviewsByMudQueryHandlerTests
{
    private readonly Mock<IReviewRepository> _reviewRepositoryMock;
    private readonly GetReviewsByMudQueryHandler _handler;

    public GetReviewsByMudQueryHandlerTests()
    {
        _reviewRepositoryMock = new Mock<IReviewRepository>();
        _handler = new GetReviewsByMudQueryHandler(_reviewRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnReviewsForMud()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var currentUserId = Guid.NewGuid();
        var expectedResult = new ReviewListDto(
            Items: new List<ReviewDto>
            {
                new(Guid.NewGuid(), mudId, "Test MUD", "test-mud",
                    new ReviewUserDto(Guid.NewGuid(), "User1", null),
                    5, "Great", "Great MUD!", 10, false, null,
                    DateTime.UtcNow, DateTime.UtcNow),
                new(Guid.NewGuid(), mudId, "Test MUD", "test-mud",
                    new ReviewUserDto(Guid.NewGuid(), "User2", null),
                    4, "Good", "Good MUD!", 5, false, null,
                    DateTime.UtcNow, DateTime.UtcNow)
            },
            TotalCount: 2,
            Page: 1,
            PageSize: 10,
            TotalPages: 1,
            AverageRating: 4.5,
            RatingDistribution: new RatingDistributionDto(0, 0, 0, 1, 1)
        );

        _reviewRepositoryMock
            .Setup(r => r.GetByMudIdAsync(mudId, currentUserId, ReviewSortBy.Newest, 1, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        var query = new GetReviewsByMudQuery(mudId, currentUserId, ReviewSortBy.Newest, 1, 10);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
        result.AverageRating.Should().Be(4.5);
    }

    [Fact]
    public async Task Handle_WhenNoReviews_ShouldReturnEmptyList()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var expectedResult = new ReviewListDto(
            Items: new List<ReviewDto>(),
            TotalCount: 0,
            Page: 1,
            PageSize: 10,
            TotalPages: 0,
            AverageRating: null,
            RatingDistribution: new RatingDistributionDto(0, 0, 0, 0, 0)
        );

        _reviewRepositoryMock
            .Setup(r => r.GetByMudIdAsync(mudId, null, ReviewSortBy.Newest, 1, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        var query = new GetReviewsByMudQuery(mudId, null, ReviewSortBy.Newest, 1, 10);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
        result.AverageRating.Should().BeNull();
    }

    [Theory]
    [InlineData(ReviewSortBy.Newest)]
    [InlineData(ReviewSortBy.Oldest)]
    [InlineData(ReviewSortBy.HighestRating)]
    [InlineData(ReviewSortBy.LowestRating)]
    [InlineData(ReviewSortBy.MostHelpful)]
    public async Task Handle_ShouldPassSortByToRepository(ReviewSortBy sortBy)
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var expectedResult = new ReviewListDto(
            Items: new List<ReviewDto>(),
            TotalCount: 0,
            Page: 1,
            PageSize: 10,
            TotalPages: 0,
            AverageRating: null,
            RatingDistribution: null
        );

        _reviewRepositoryMock
            .Setup(r => r.GetByMudIdAsync(mudId, null, sortBy, 1, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        var query = new GetReviewsByMudQuery(mudId, null, sortBy, 1, 10);

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        _reviewRepositoryMock.Verify(r => r.GetByMudIdAsync(mudId, null, sortBy, 1, 10, It.IsAny<CancellationToken>()), Times.Once);
    }
}
