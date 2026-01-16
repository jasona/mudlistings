using FluentAssertions;
using Moq;
using MudListings.Application.Admin.Commands;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Tests.Application.Admin;

public class ImportMudsCommandTests
{
    private readonly Mock<IMudRepository> _mudRepositoryMock;
    private readonly Mock<IAdminRepository> _adminRepositoryMock;
    private readonly ImportMudsCommandHandler _handler;

    public ImportMudsCommandTests()
    {
        _mudRepositoryMock = new Mock<IMudRepository>();
        _adminRepositoryMock = new Mock<IAdminRepository>();
        _handler = new ImportMudsCommandHandler(
            _mudRepositoryMock.Object,
            _adminRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ValidRows_ImportsSuccessfully()
    {
        // Arrange
        var rows = new List<ImportMudRow>
        {
            new ImportMudRow("Test MUD 1", "Description 1", "mud1.example.com", 4000, "http://mud1.com", "DikuMUD", "C", "Fantasy,SciFi"),
            new ImportMudRow("Test MUD 2", "Description 2", "mud2.example.com", 5000, null, null, null, null)
        };

        _mudRepositoryMock.Setup(x => x.SlugExistsAsync(It.IsAny<string>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _mudRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<Mud>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Mud mud, CancellationToken _) => mud);
        _adminRepositoryMock.Setup(x => x.CreateAuditLogAsync(It.IsAny<AuditLog>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new ImportMudsCommand(rows, Guid.NewGuid());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.TotalRows.Should().Be(2);
        result.SuccessCount.Should().Be(2);
        result.ErrorCount.Should().Be(0);
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_InvalidRows_CollectsErrors()
    {
        // Arrange
        var rows = new List<ImportMudRow>
        {
            new ImportMudRow("", "Description", "host.com", 4000, null, null, null, null), // Missing name
            new ImportMudRow("Test", "", "host.com", 4000, null, null, null, null), // Missing description
            new ImportMudRow("Test", "Desc", "", 4000, null, null, null, null), // Missing host
            new ImportMudRow("Test", "Desc", "host.com", 0, null, null, null, null) // Invalid port
        };

        var command = new ImportMudsCommand(rows, Guid.NewGuid());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.TotalRows.Should().Be(4);
        result.SuccessCount.Should().Be(0);
        result.ErrorCount.Should().Be(4);
        result.Errors.Should().HaveCount(4);
    }

    [Fact]
    public async Task Handle_DuplicateSlug_GeneratesUniqueSlug()
    {
        // Arrange
        var rows = new List<ImportMudRow>
        {
            new ImportMudRow("Test MUD", "Description", "host.com", 4000, null, null, null, null)
        };

        _mudRepositoryMock.Setup(x => x.SlugExistsAsync("test-mud", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _mudRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<Mud>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Mud mud, CancellationToken _) => mud);
        _adminRepositoryMock.Setup(x => x.CreateAuditLogAsync(It.IsAny<AuditLog>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new ImportMudsCommand(rows, Guid.NewGuid());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.SuccessCount.Should().Be(1);
        _mudRepositoryMock.Verify(
            x => x.CreateAsync(It.Is<Mud>(m => m.Slug.StartsWith("test-mud-")), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ParsesGenresCorrectly()
    {
        // Arrange
        var rows = new List<ImportMudRow>
        {
            new ImportMudRow("Test MUD", "Description", "host.com", 4000, null, null, null, "Fantasy, SciFi, PvP")
        };

        Mud? createdMud = null;
        _mudRepositoryMock.Setup(x => x.SlugExistsAsync(It.IsAny<string>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _mudRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<Mud>(), It.IsAny<CancellationToken>()))
            .Callback<Mud, CancellationToken>((mud, _) => createdMud = mud)
            .ReturnsAsync((Mud mud, CancellationToken _) => mud);
        _adminRepositoryMock.Setup(x => x.CreateAuditLogAsync(It.IsAny<AuditLog>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new ImportMudsCommand(rows, Guid.NewGuid());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.SuccessCount.Should().Be(1);
        createdMud.Should().NotBeNull();
        createdMud!.MudGenres.Should().HaveCount(3);
    }
}
