using FluentAssertions;
using Moq;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;
using MudListings.Application.Muds.Queries;

namespace MudListings.Tests.Application.Muds.Queries;

public class GetAutocompleteQueryHandlerTests
{
    private readonly Mock<IMudRepository> _mudRepositoryMock;
    private readonly GetAutocompleteQueryHandler _handler;

    public GetAutocompleteQueryHandlerTests()
    {
        _mudRepositoryMock = new Mock<IMudRepository>();
        _handler = new GetAutocompleteQueryHandler(_mudRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidQuery_ShouldReturnSuggestions()
    {
        // Arrange
        var suggestions = new List<AutocompleteSuggestionDto>
        {
            new(Guid.NewGuid(), "Test MUD", "test-mud", "A test MUD", true),
            new(Guid.NewGuid(), "Testing Ground", "testing-ground", "A testing MUD", false)
        };

        _mudRepositoryMock
            .Setup(r => r.GetAutocompleteAsync("test", 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(suggestions);

        var query = new GetAutocompleteQuery("test");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result.Should().AllSatisfy(s => s.Name.Should().Contain("Test"));
    }

    [Fact]
    public async Task Handle_WithCustomLimit_ShouldPassLimitToRepository()
    {
        // Arrange
        _mudRepositoryMock
            .Setup(r => r.GetAutocompleteAsync(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AutocompleteSuggestionDto>());

        var query = new GetAutocompleteQuery("test", 5);

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        _mudRepositoryMock.Verify(r => r.GetAutocompleteAsync("test", 5, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenNoMatches_ShouldReturnEmptyList()
    {
        // Arrange
        _mudRepositoryMock
            .Setup(r => r.GetAutocompleteAsync(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AutocompleteSuggestionDto>());

        var query = new GetAutocompleteQuery("nonexistent");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }
}
