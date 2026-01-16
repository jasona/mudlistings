using FluentAssertions;
using Moq;
using MudListings.Application.Interfaces;
using MudListings.Application.Muds.Queries;
using MudListings.Domain.Entities;
using MudListings.Domain.ValueObjects;

namespace MudListings.Tests.Application.Muds.Queries;

public class GetMudStatusHistoryQueryHandlerTests
{
    private readonly Mock<IMudRepository> _mudRepositoryMock;
    private readonly GetMudStatusHistoryQueryHandler _handler;

    public GetMudStatusHistoryQueryHandlerTests()
    {
        _mudRepositoryMock = new Mock<IMudRepository>();
        _handler = new GetMudStatusHistoryQueryHandler(_mudRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WhenMudExistsWithHistory_ShouldReturnFullResponse()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var mud = new Mud
        {
            Id = mudId,
            Name = "Test MUD",
            IsOnline = true,
            LastOnlineCheck = DateTime.UtcNow,
            CurrentMsspData = new MsspData { GameName = "Test MUD", Players = 42 }
        };

        var history = new List<MudStatusSnapshot>
        {
            new(DateTime.UtcNow.AddHours(-1), true, 40),
            new(DateTime.UtcNow.AddHours(-2), true, 35),
            new(DateTime.UtcNow.AddHours(-3), false, null),
            new(DateTime.UtcNow.AddHours(-4), true, 50)
        };

        _mudRepositoryMock
            .Setup(r => r.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);

        _mudRepositoryMock
            .Setup(r => r.GetStatusHistoryAsync(mudId, 24, It.IsAny<CancellationToken>()))
            .ReturnsAsync(history);

        var query = new GetMudStatusHistoryQuery(mudId, 24);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.MudId.Should().Be(mudId);
        result.MudName.Should().Be("Test MUD");
        result.History.Should().HaveCount(4);
        result.CurrentStatus.IsOnline.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_ShouldCalculateCorrectStats()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var mud = new Mud { Id = mudId, Name = "Test MUD", IsOnline = true };

        var history = new List<MudStatusSnapshot>
        {
            new(DateTime.UtcNow.AddHours(-1), true, 40),
            new(DateTime.UtcNow.AddHours(-2), true, 35),
            new(DateTime.UtcNow.AddHours(-3), false, null),
            new(DateTime.UtcNow.AddHours(-4), true, 50)
        };

        _mudRepositoryMock
            .Setup(r => r.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);

        _mudRepositoryMock
            .Setup(r => r.GetStatusHistoryAsync(mudId, 24, It.IsAny<CancellationToken>()))
            .ReturnsAsync(history);

        var query = new GetMudStatusHistoryQuery(mudId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result!.Stats.UptimePercentage.Should().Be(75); // 3 out of 4 online
        result.Stats.AveragePlayerCount.Should().Be(41); // (40+35+50)/3 = 41.67 -> 41
        result.Stats.PeakPlayerCount.Should().Be(50);
        result.Stats.LastOnline.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_WhenMudNotFound_ShouldReturnNull()
    {
        // Arrange
        var mudId = Guid.NewGuid();

        _mudRepositoryMock
            .Setup(r => r.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Mud?)null);

        var query = new GetMudStatusHistoryQuery(mudId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WhenNoHistory_ShouldReturnEmptyHistoryWithZeroStats()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var mud = new Mud { Id = mudId, Name = "Test MUD", IsOnline = false };

        _mudRepositoryMock
            .Setup(r => r.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);

        _mudRepositoryMock
            .Setup(r => r.GetStatusHistoryAsync(mudId, 24, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<MudStatusSnapshot>());

        var query = new GetMudStatusHistoryQuery(mudId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result!.History.Should().BeEmpty();
        result.Stats.UptimePercentage.Should().Be(0);
        result.Stats.AveragePlayerCount.Should().BeNull();
        result.Stats.PeakPlayerCount.Should().BeNull();
    }
}
