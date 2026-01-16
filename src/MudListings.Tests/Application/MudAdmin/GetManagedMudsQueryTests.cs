using FluentAssertions;
using Moq;
using MudListings.Application.DTOs.MudAdmin;
using MudListings.Application.Interfaces;
using MudListings.Application.MudAdmin.Queries;

namespace MudListings.Tests.Application.MudAdmin;

public class GetManagedMudsQueryTests
{
    private readonly Mock<IMudAdminRepository> _mudAdminRepositoryMock;
    private readonly GetManagedMudsQueryHandler _handler;

    public GetManagedMudsQueryTests()
    {
        _mudAdminRepositoryMock = new Mock<IMudAdminRepository>();
        _handler = new GetManagedMudsQueryHandler(_mudAdminRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_UserWithMuds_ReturnsManagedMuds()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var managedMuds = new List<ManagedMudDto>
        {
            new ManagedMudDto(
                Guid.NewGuid(),
                "Test MUD 1",
                "test-mud-1",
                true,
                true,
                true,
                10,
                4.5,
                100,
                1000,
                50
            ),
            new ManagedMudDto(
                Guid.NewGuid(),
                "Test MUD 2",
                "test-mud-2",
                false,
                true,
                false,
                0,
                3.8,
                50,
                500,
                25
            )
        };

        _mudAdminRepositoryMock.Setup(x => x.GetManagedMudsForUserAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(managedMuds);

        var query = new GetManagedMudsQuery(userId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result.Should().ContainSingle(m => m.IsOwner);
        result.Should().ContainSingle(m => m.MudName == "Test MUD 1");
    }

    [Fact]
    public async Task Handle_UserWithNoMuds_ReturnsEmptyList()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _mudAdminRepositoryMock.Setup(x => x.GetManagedMudsForUserAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ManagedMudDto>());

        var query = new GetManagedMudsQuery(userId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }
}
