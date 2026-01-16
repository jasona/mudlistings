using FluentAssertions;
using Moq;
using MudListings.Application.Interfaces;
using MudListings.Application.MudAdmin.Queries;
using MudListings.Domain.Entities;
using MudListings.Domain.ValueObjects;

namespace MudListings.Tests.Application.MudAdmin;

public class GetMudAnalyticsQueryTests
{
    private readonly Mock<IMudAdminRepository> _mudAdminRepositoryMock;
    private readonly Mock<IMudRepository> _mudRepositoryMock;
    private readonly Mock<IReviewRepository> _reviewRepositoryMock;
    private readonly Mock<IFavoriteRepository> _favoriteRepositoryMock;
    private readonly GetMudAnalyticsQueryHandler _handler;

    public GetMudAnalyticsQueryTests()
    {
        _mudAdminRepositoryMock = new Mock<IMudAdminRepository>();
        _mudRepositoryMock = new Mock<IMudRepository>();
        _reviewRepositoryMock = new Mock<IReviewRepository>();
        _favoriteRepositoryMock = new Mock<IFavoriteRepository>();
        _handler = new GetMudAnalyticsQueryHandler(
            _mudAdminRepositoryMock.Object,
            _mudRepositoryMock.Object,
            _reviewRepositoryMock.Object,
            _favoriteRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ValidAdmin_ReturnsAnalytics()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var adminUserId = Guid.NewGuid();

        var mud = new Mud
        {
            Id = mudId,
            Name = "Test MUD",
            ViewCount = 1500,
            IsOnline = true,
            CurrentMsspData = new MsspData { Players = 25 }
        };

        _mudAdminRepositoryMock.Setup(x => x.IsUserAdminOfMudAsync(adminUserId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _mudRepositoryMock.Setup(x => x.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);
        _reviewRepositoryMock.Setup(x => x.GetAggregateRatingAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((4.5, 100));
        _favoriteRepositoryMock.Setup(x => x.GetFavoriteCountForMudAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(75);

        var query = new GetMudAnalyticsQuery(mudId, adminUserId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.MudId.Should().Be(mudId);
        result.MudName.Should().Be("Test MUD");
        result.TotalViews.Should().Be(1500);
        result.TotalReviews.Should().Be(100);
        result.AverageRating.Should().Be(4.5);
        result.TotalFavorites.Should().Be(75);
        result.AveragePlayerCount.Should().Be(25);
        result.UptimePercentage.Should().Be(100.0);
    }

    [Fact]
    public async Task Handle_NotAdmin_ReturnsNull()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _mudAdminRepositoryMock.Setup(x => x.IsUserAdminOfMudAsync(userId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var query = new GetMudAnalyticsQuery(mudId, userId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_MudNotFound_ReturnsNull()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var adminUserId = Guid.NewGuid();

        _mudAdminRepositoryMock.Setup(x => x.IsUserAdminOfMudAsync(adminUserId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _mudRepositoryMock.Setup(x => x.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Mud?)null);

        var query = new GetMudAnalyticsQuery(mudId, adminUserId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_OfflineMud_ReturnsZeroUptime()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var adminUserId = Guid.NewGuid();

        var mud = new Mud
        {
            Id = mudId,
            Name = "Offline MUD",
            ViewCount = 500,
            IsOnline = false
        };

        _mudAdminRepositoryMock.Setup(x => x.IsUserAdminOfMudAsync(adminUserId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _mudRepositoryMock.Setup(x => x.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);
        _reviewRepositoryMock.Setup(x => x.GetAggregateRatingAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((0.0, 0));
        _favoriteRepositoryMock.Setup(x => x.GetFavoriteCountForMudAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(10);

        var query = new GetMudAnalyticsQuery(mudId, adminUserId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.UptimePercentage.Should().Be(0.0);
    }
}
