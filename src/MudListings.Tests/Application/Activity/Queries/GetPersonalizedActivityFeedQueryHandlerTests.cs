using FluentAssertions;
using Moq;
using MudListings.Application.Activity.Queries;
using MudListings.Application.DTOs.Activity;
using MudListings.Application.Interfaces;
using MudListings.Domain.Enums;

namespace MudListings.Tests.Application.Activity.Queries;

public class GetPersonalizedActivityFeedQueryHandlerTests
{
    private readonly Mock<IActivityRepository> _activityRepositoryMock;
    private readonly GetPersonalizedActivityFeedQueryHandler _handler;

    public GetPersonalizedActivityFeedQueryHandlerTests()
    {
        _activityRepositoryMock = new Mock<IActivityRepository>();
        _handler = new GetPersonalizedActivityFeedQueryHandler(_activityRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnPersonalizedFeedForUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var expectedResult = new ActivityFeedDto(
            Items: new List<ActivityEventDto>
            {
                new(Guid.NewGuid(), ActivityEventType.StatusChange, "StatusChange",
                    null,
                    new ActivityMudDto(Guid.NewGuid(), "Favorited MUD", "favorited-mud", true),
                    "Favorited MUD is now online",
                    DateTime.UtcNow)
            },
            TotalCount: 1,
            Page: 1,
            PageSize: 20,
            TotalPages: 1,
            HasMore: false
        );

        _activityRepositoryMock
            .Setup(r => r.GetPersonalizedFeedAsync(userId, 1, 20, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        var query = new GetPersonalizedActivityFeedQuery(userId, 1, 20);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(1);
        result.Items[0].TypeName.Should().Be("StatusChange");
    }

    [Fact]
    public async Task Handle_WhenNoFavorites_ShouldReturnEmptyFeed()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var expectedResult = new ActivityFeedDto(
            Items: new List<ActivityEventDto>(),
            TotalCount: 0,
            Page: 1,
            PageSize: 20,
            TotalPages: 0,
            HasMore: false
        );

        _activityRepositoryMock
            .Setup(r => r.GetPersonalizedFeedAsync(userId, 1, 20, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        var query = new GetPersonalizedActivityFeedQuery(userId, 1, 20);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }
}
