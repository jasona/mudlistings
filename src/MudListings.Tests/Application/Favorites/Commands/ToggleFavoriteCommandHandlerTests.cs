using FluentAssertions;
using Moq;
using MudListings.Application.Favorites.Commands;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Tests.Application.Favorites.Commands;

public class ToggleFavoriteCommandHandlerTests
{
    private readonly Mock<IFavoriteRepository> _favoriteRepositoryMock;
    private readonly Mock<IMudRepository> _mudRepositoryMock;
    private readonly ToggleFavoriteCommandHandler _handler;

    public ToggleFavoriteCommandHandlerTests()
    {
        _favoriteRepositoryMock = new Mock<IFavoriteRepository>();
        _mudRepositoryMock = new Mock<IMudRepository>();
        _handler = new ToggleFavoriteCommandHandler(_favoriteRepositoryMock.Object, _mudRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WhenMudExistsAndNotFavorited_ShouldAddFavorite()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var mud = new Mud { Id = mudId, Name = "Test MUD", FavoriteCount = 5 };

        _mudRepositoryMock
            .Setup(r => r.ExistsAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _mudRepositoryMock
            .Setup(r => r.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);

        _favoriteRepositoryMock
            .Setup(r => r.IsFavoritedAsync(userId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _favoriteRepositoryMock
            .Setup(r => r.GetFavoriteCountForMudAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(6);

        var command = new ToggleFavoriteCommand(mudId, userId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.IsFavorited.Should().BeTrue();
        result.NewFavoriteCount.Should().Be(6);
        _favoriteRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Favorite>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenMudExistsAndAlreadyFavorited_ShouldRemoveFavorite()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var mud = new Mud { Id = mudId, Name = "Test MUD", FavoriteCount = 5 };

        _mudRepositoryMock
            .Setup(r => r.ExistsAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _mudRepositoryMock
            .Setup(r => r.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);

        _favoriteRepositoryMock
            .Setup(r => r.IsFavoritedAsync(userId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _favoriteRepositoryMock
            .Setup(r => r.GetFavoriteCountForMudAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(4);

        var command = new ToggleFavoriteCommand(mudId, userId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.IsFavorited.Should().BeFalse();
        result.NewFavoriteCount.Should().Be(4);
        _favoriteRepositoryMock.Verify(r => r.RemoveAsync(userId, mudId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenMudDoesNotExist_ShouldReturnNull()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _mudRepositoryMock
            .Setup(r => r.ExistsAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var command = new ToggleFavoriteCommand(mudId, userId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeNull();
        _favoriteRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Favorite>(), It.IsAny<CancellationToken>()), Times.Never);
        _favoriteRepositoryMock.Verify(r => r.RemoveAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
