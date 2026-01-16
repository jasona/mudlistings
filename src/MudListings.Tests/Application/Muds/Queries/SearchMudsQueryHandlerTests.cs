using FluentAssertions;
using Moq;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;
using MudListings.Application.Muds.Queries;

namespace MudListings.Tests.Application.Muds.Queries;

public class SearchMudsQueryHandlerTests
{
    private readonly Mock<IMudRepository> _mudRepositoryMock;
    private readonly SearchMudsQueryHandler _handler;

    public SearchMudsQueryHandlerTests()
    {
        _mudRepositoryMock = new Mock<IMudRepository>();
        _handler = new SearchMudsQueryHandler(_mudRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithDefaultParams_ShouldCallRepositorySearch()
    {
        // Arrange
        var searchParams = new MudSearchParams();
        var expectedResult = new MudSearchResultDto(
            Items: new List<MudListDto>(),
            TotalCount: 0,
            Page: 1,
            PageSize: 20,
            TotalPages: 0,
            HasNextPage: false,
            HasPreviousPage: false
        );

        _mudRepositoryMock
            .Setup(r => r.SearchAsync(It.IsAny<MudSearchParams>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        var query = new SearchMudsQuery(searchParams);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeEquivalentTo(expectedResult);
        _mudRepositoryMock.Verify(r => r.SearchAsync(searchParams, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithSearchQuery_ShouldPassQueryToRepository()
    {
        // Arrange
        var searchParams = new MudSearchParams(Query: "test mud");
        var expectedResult = new MudSearchResultDto(
            Items: new List<MudListDto>
            {
                new(
                    Id: Guid.NewGuid(),
                    Name: "Test MUD",
                    Slug: "test-mud",
                    ShortDescription: "A test MUD",
                    Genres: new List<string> { "Fantasy" },
                    IsOnline: true,
                    PlayerCount: 42,
                    RatingAverage: 4.5,
                    RatingCount: 10,
                    FavoriteCount: 5,
                    IsFeatured: false,
                    CreatedAt: DateTime.UtcNow
                )
            },
            TotalCount: 1,
            Page: 1,
            PageSize: 20,
            TotalPages: 1,
            HasNextPage: false,
            HasPreviousPage: false
        );

        _mudRepositoryMock
            .Setup(r => r.SearchAsync(It.Is<MudSearchParams>(p => p.Query == "test mud"), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        var query = new SearchMudsQuery(searchParams);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalCount.Should().Be(1);
        result.Items.Should().HaveCount(1);
        result.Items[0].Name.Should().Be("Test MUD");
    }

    [Fact]
    public async Task Handle_WithPagination_ShouldReturnCorrectPageMetadata()
    {
        // Arrange
        var searchParams = new MudSearchParams(Page: 2, PageSize: 10);
        var expectedResult = new MudSearchResultDto(
            Items: new List<MudListDto>(),
            TotalCount: 25,
            Page: 2,
            PageSize: 10,
            TotalPages: 3,
            HasNextPage: true,
            HasPreviousPage: true
        );

        _mudRepositoryMock
            .Setup(r => r.SearchAsync(It.IsAny<MudSearchParams>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        var query = new SearchMudsQuery(searchParams);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Page.Should().Be(2);
        result.PageSize.Should().Be(10);
        result.TotalPages.Should().Be(3);
        result.HasNextPage.Should().BeTrue();
        result.HasPreviousPage.Should().BeTrue();
    }
}
