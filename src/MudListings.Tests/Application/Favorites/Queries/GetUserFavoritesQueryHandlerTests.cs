using FluentAssertions;
using Moq;
using MudListings.Application.DTOs.Favorites;
using MudListings.Application.Favorites.Queries;
using MudListings.Application.Interfaces;

namespace MudListings.Tests.Application.Favorites.Queries;

public class GetUserFavoritesQueryHandlerTests
{
    private readonly Mock<IFavoriteRepository> _favoriteRepositoryMock;
    private readonly GetUserFavoritesQueryHandler _handler;

    public GetUserFavoritesQueryHandlerTests()
    {
        _favoriteRepositoryMock = new Mock<IFavoriteRepository>();
        _handler = new GetUserFavoritesQueryHandler(_favoriteRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnUserFavorites()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var expectedResult = new FavoriteListDto(
            Items: new List<FavoriteDto>
            {
                new(Guid.NewGuid(), "Test MUD 1", "test-mud-1", "Short desc",
                    new List<string> { "Fantasy" }, true, 10, 4.5, 5, DateTime.UtcNow),
                new(Guid.NewGuid(), "Test MUD 2", "test-mud-2", "Short desc 2",
                    new List<string> { "SciFi" }, false, null, 3.5, 3, DateTime.UtcNow)
            },
            TotalCount: 2,
            Page: 1,
            PageSize: 20,
            TotalPages: 1
        );

        _favoriteRepositoryMock
            .Setup(r => r.GetByUserIdAsync(userId, 1, 20, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        var query = new GetUserFavoritesQuery(userId, 1, 20);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task Handle_WhenNoFavorites_ShouldReturnEmptyList()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var expectedResult = new FavoriteListDto(
            Items: new List<FavoriteDto>(),
            TotalCount: 0,
            Page: 1,
            PageSize: 20,
            TotalPages: 0
        );

        _favoriteRepositoryMock
            .Setup(r => r.GetByUserIdAsync(userId, 1, 20, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        var query = new GetUserFavoritesQuery(userId, 1, 20);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }
}
