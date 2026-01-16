using FluentAssertions;
using Moq;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;
using MudListings.Application.Muds.Queries;

namespace MudListings.Tests.Application.Muds.Queries;

public class GetFeaturedMudsQueryHandlerTests
{
    private readonly Mock<IMudRepository> _mudRepositoryMock;
    private readonly GetFeaturedMudsQueryHandler _handler;

    public GetFeaturedMudsQueryHandlerTests()
    {
        _mudRepositoryMock = new Mock<IMudRepository>();
        _handler = new GetFeaturedMudsQueryHandler(_mudRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithDefaultLimit_ShouldReturnFeaturedMuds()
    {
        // Arrange
        var featuredMuds = new List<MudListDto>
        {
            CreateMudListDto("Featured MUD 1", true),
            CreateMudListDto("Featured MUD 2", true)
        };

        _mudRepositoryMock
            .Setup(r => r.GetFeaturedAsync(5, It.IsAny<CancellationToken>()))
            .ReturnsAsync(featuredMuds);

        var query = new GetFeaturedMudsQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result.Should().AllSatisfy(m => m.IsFeatured.Should().BeTrue());
    }

    [Fact]
    public async Task Handle_WithCustomLimit_ShouldPassLimitToRepository()
    {
        // Arrange
        var featuredMuds = new List<MudListDto>();

        _mudRepositoryMock
            .Setup(r => r.GetFeaturedAsync(10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(featuredMuds);

        var query = new GetFeaturedMudsQuery(10);

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        _mudRepositoryMock.Verify(r => r.GetFeaturedAsync(10, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenNoFeaturedMuds_ShouldReturnEmptyList()
    {
        // Arrange
        _mudRepositoryMock
            .Setup(r => r.GetFeaturedAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<MudListDto>());

        var query = new GetFeaturedMudsQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }

    private static MudListDto CreateMudListDto(string name, bool isFeatured)
    {
        return new MudListDto(
            Id: Guid.NewGuid(),
            Name: name,
            Slug: name.ToLowerInvariant().Replace(" ", "-"),
            ShortDescription: $"Description of {name}",
            Genres: new List<string> { "Fantasy" },
            IsOnline: true,
            PlayerCount: 42,
            RatingAverage: 4.5,
            RatingCount: 10,
            FavoriteCount: 5,
            IsFeatured: isFeatured,
            CreatedAt: DateTime.UtcNow
        );
    }
}
