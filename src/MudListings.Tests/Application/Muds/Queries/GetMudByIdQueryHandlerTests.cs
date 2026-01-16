using FluentAssertions;
using Moq;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;
using MudListings.Application.Muds.Queries;

namespace MudListings.Tests.Application.Muds.Queries;

public class GetMudByIdQueryHandlerTests
{
    private readonly Mock<IMudRepository> _mudRepositoryMock;
    private readonly GetMudByIdQueryHandler _handler;

    public GetMudByIdQueryHandlerTests()
    {
        _mudRepositoryMock = new Mock<IMudRepository>();
        _handler = new GetMudByIdQueryHandler(_mudRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WhenMudExists_ShouldReturnMudDetail()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var mudDetail = CreateMudDetailDto(mudId, "Test MUD");

        _mudRepositoryMock
            .Setup(r => r.GetDetailByIdAsync(mudId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mudDetail);

        var query = new GetMudByIdQuery(mudId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(mudId);
        result.Name.Should().Be("Test MUD");
    }

    [Fact]
    public async Task Handle_WhenMudExists_ShouldIncrementViewCount()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var mudDetail = CreateMudDetailDto(mudId, "Test MUD");

        _mudRepositoryMock
            .Setup(r => r.GetDetailByIdAsync(mudId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mudDetail);

        var query = new GetMudByIdQuery(mudId);

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        _mudRepositoryMock.Verify(
            r => r.IncrementViewCountAsync(mudId, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenMudDoesNotExist_ShouldReturnNull()
    {
        // Arrange
        var mudId = Guid.NewGuid();

        _mudRepositoryMock
            .Setup(r => r.GetDetailByIdAsync(mudId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((MudDetailDto?)null);

        var query = new GetMudByIdQuery(mudId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WhenMudDoesNotExist_ShouldNotIncrementViewCount()
    {
        // Arrange
        var mudId = Guid.NewGuid();

        _mudRepositoryMock
            .Setup(r => r.GetDetailByIdAsync(mudId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((MudDetailDto?)null);

        var query = new GetMudByIdQuery(mudId);

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        _mudRepositoryMock.Verify(
            r => r.IncrementViewCountAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_WithCurrentUserId_ShouldPassUserIdToRepository()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var currentUserId = Guid.NewGuid();
        var mudDetail = CreateMudDetailDto(mudId, "Test MUD");

        _mudRepositoryMock
            .Setup(r => r.GetDetailByIdAsync(mudId, currentUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mudDetail);

        var query = new GetMudByIdQuery(mudId, currentUserId);

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        _mudRepositoryMock.Verify(
            r => r.GetDetailByIdAsync(mudId, currentUserId, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    private static MudDetailDto CreateMudDetailDto(Guid id, string name)
    {
        return new MudDetailDto(
            Id: id,
            Name: name,
            Slug: name.ToLowerInvariant().Replace(" ", "-"),
            Description: $"Full description of {name}",
            ShortDescription: $"Short description of {name}",
            Genres: new List<string> { "Fantasy" },
            Connection: new ConnectionInfoDto("mud.example.com", 4000, null),
            Website: "https://example.com",
            DiscordUrl: null,
            WikiUrl: null,
            Codebase: "DikuMUD",
            Language: "English",
            EstablishedDate: DateTime.UtcNow.AddYears(-10),
            IsOnline: true,
            LastOnlineCheck: DateTime.UtcNow.AddMinutes(-5),
            CurrentStatus: null,
            RatingAverage: 4.5,
            RatingCount: 10,
            FavoriteCount: 5,
            ViewCount: 100,
            IsFeatured: false,
            CreatedAt: DateTime.UtcNow.AddMonths(-6),
            UpdatedAt: DateTime.UtcNow,
            IsFavorited: false,
            IsClaimedByCurrentUser: false
        );
    }
}
