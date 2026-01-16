using FluentAssertions;
using Moq;
using MudListings.Application.Interfaces;
using MudListings.Application.Muds.Queries;
using MudListings.Domain.Entities;
using MudListings.Domain.ValueObjects;

namespace MudListings.Tests.Application.Muds.Queries;

public class GetMudStatusQueryHandlerTests
{
    private readonly Mock<IMudRepository> _mudRepositoryMock;
    private readonly GetMudStatusQueryHandler _handler;

    public GetMudStatusQueryHandlerTests()
    {
        _mudRepositoryMock = new Mock<IMudRepository>();
        _handler = new GetMudStatusQueryHandler(_mudRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WhenMudExists_ShouldReturnStatus()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var mud = new Mud
        {
            Id = mudId,
            Name = "Test MUD",
            IsOnline = true,
            LastOnlineCheck = DateTime.UtcNow,
            CurrentMsspData = new MsspData
            {
                GameName = "Test MUD",
                Players = 42
            }
        };

        _mudRepositoryMock
            .Setup(r => r.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);

        var query = new GetMudStatusQuery(mudId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.MudId.Should().Be(mudId);
        result.IsOnline.Should().BeTrue();
        result.PlayerCount.Should().Be(42);
        result.MsspData.Should().NotBeNull();
        result.MsspData!.GameName.Should().Be("Test MUD");
    }

    [Fact]
    public async Task Handle_WhenMudNotFound_ShouldReturnNull()
    {
        // Arrange
        var mudId = Guid.NewGuid();

        _mudRepositoryMock
            .Setup(r => r.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Mud?)null);

        var query = new GetMudStatusQuery(mudId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WhenMudHasNoMsspData_ShouldReturnStatusWithNullMsspData()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var mud = new Mud
        {
            Id = mudId,
            Name = "Test MUD",
            IsOnline = false,
            LastOnlineCheck = DateTime.UtcNow.AddMinutes(-10),
            CurrentMsspData = null
        };

        _mudRepositoryMock
            .Setup(r => r.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);

        var query = new GetMudStatusQuery(mudId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.IsOnline.Should().BeFalse();
        result.PlayerCount.Should().BeNull();
        result.MsspData.Should().BeNull();
    }
}
