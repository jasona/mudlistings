using FluentAssertions;
using Moq;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;
using MudListings.Application.Muds.Queries;

namespace MudListings.Tests.Application.Muds.Queries;

public class GetGenreStatsQueryHandlerTests
{
    private readonly Mock<IMudRepository> _mudRepositoryMock;
    private readonly GetGenreStatsQueryHandler _handler;

    public GetGenreStatsQueryHandlerTests()
    {
        _mudRepositoryMock = new Mock<IMudRepository>();
        _handler = new GetGenreStatsQueryHandler(_mudRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnGenreStats()
    {
        // Arrange
        var genreStats = new List<GenreDto>
        {
            new("Fantasy", "Fantasy", 10),
            new("SciFi", "Sci-Fi", 5),
            new("Horror", "Horror", 3)
        };

        _mudRepositoryMock
            .Setup(r => r.GetGenreStatsAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(genreStats);

        var query = new GetGenreStatsQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(3);
        result.Should().Contain(g => g.Name == "Fantasy" && g.MudCount == 10);
        result.Should().Contain(g => g.Name == "SciFi" && g.DisplayName == "Sci-Fi");
    }

    [Fact]
    public async Task Handle_WhenNoMuds_ShouldReturnAllGenresWithZeroCounts()
    {
        // Arrange
        var genreStats = new List<GenreDto>
        {
            new("Fantasy", "Fantasy", 0),
            new("SciFi", "Sci-Fi", 0)
        };

        _mudRepositoryMock
            .Setup(r => r.GetGenreStatsAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(genreStats);

        var query = new GetGenreStatsQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().AllSatisfy(g => g.MudCount.Should().Be(0));
    }
}
