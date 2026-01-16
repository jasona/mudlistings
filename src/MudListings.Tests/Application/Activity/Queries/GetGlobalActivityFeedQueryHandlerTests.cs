using FluentAssertions;
using Moq;
using MudListings.Application.Activity.Queries;
using MudListings.Application.DTOs.Activity;
using MudListings.Application.Interfaces;
using MudListings.Domain.Enums;

namespace MudListings.Tests.Application.Activity.Queries;

public class GetGlobalActivityFeedQueryHandlerTests
{
    private readonly Mock<IActivityRepository> _activityRepositoryMock;
    private readonly GetGlobalActivityFeedQueryHandler _handler;

    public GetGlobalActivityFeedQueryHandlerTests()
    {
        _activityRepositoryMock = new Mock<IActivityRepository>();
        _handler = new GetGlobalActivityFeedQueryHandler(_activityRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnGlobalActivityFeed()
    {
        // Arrange
        var expectedResult = new ActivityFeedDto(
            Items: new List<ActivityEventDto>
            {
                new(Guid.NewGuid(), ActivityEventType.NewListing, "NewListing",
                    null,
                    new ActivityMudDto(Guid.NewGuid(), "Test MUD", "test-mud", true),
                    "New MUD listing: Test MUD",
                    DateTime.UtcNow),
                new(Guid.NewGuid(), ActivityEventType.NewReview, "NewReview",
                    new ActivityUserDto(Guid.NewGuid(), "TestUser", null),
                    new ActivityMudDto(Guid.NewGuid(), "Test MUD 2", "test-mud-2", true),
                    "New 5-star review for Test MUD 2",
                    DateTime.UtcNow)
            },
            TotalCount: 2,
            Page: 1,
            PageSize: 20,
            TotalPages: 1,
            HasMore: false
        );

        _activityRepositoryMock
            .Setup(r => r.GetGlobalFeedAsync(1, 20, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        var query = new GetGlobalActivityFeedQuery(1, 20);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
        result.HasMore.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WhenNoActivity_ShouldReturnEmptyFeed()
    {
        // Arrange
        var expectedResult = new ActivityFeedDto(
            Items: new List<ActivityEventDto>(),
            TotalCount: 0,
            Page: 1,
            PageSize: 20,
            TotalPages: 0,
            HasMore: false
        );

        _activityRepositoryMock
            .Setup(r => r.GetGlobalFeedAsync(1, 20, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        var query = new GetGlobalActivityFeedQuery(1, 20);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }
}
