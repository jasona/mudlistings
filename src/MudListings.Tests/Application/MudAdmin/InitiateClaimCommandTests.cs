using FluentAssertions;
using Moq;
using MudListings.Application.Interfaces;
using MudListings.Application.MudAdmin.Commands;
using MudListings.Domain.Entities;
using MudAdminEntity = MudListings.Domain.Entities.MudAdmin;

namespace MudListings.Tests.Application.MudAdmin;

public class InitiateClaimCommandTests
{
    private readonly Mock<IMudAdminRepository> _mudAdminRepositoryMock;
    private readonly Mock<IMudRepository> _mudRepositoryMock;
    private readonly InitiateClaimCommandHandler _handler;

    public InitiateClaimCommandTests()
    {
        _mudAdminRepositoryMock = new Mock<IMudAdminRepository>();
        _mudRepositoryMock = new Mock<IMudRepository>();
        _handler = new InitiateClaimCommandHandler(_mudAdminRepositoryMock.Object, _mudRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ValidClaim_ReturnsClaimInitiationDto()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var mud = new Mud { Id = mudId, Name = "Test MUD" };

        _mudRepositoryMock.Setup(x => x.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);
        _mudAdminRepositoryMock.Setup(x => x.IsMudClaimedAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _mudAdminRepositoryMock.Setup(x => x.HasPendingClaimAsync(userId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _mudAdminRepositoryMock.Setup(x => x.IsUserAdminOfMudAsync(userId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _mudAdminRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<MudAdminEntity>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((MudAdminEntity admin, CancellationToken _) => admin);

        var command = new InitiateClaimCommand(mudId, userId, MudAdminVerificationMethod.Mssp);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.ClaimId.Should().NotBeEmpty();
        result.VerificationCode.Should().StartWith("MUDL-");
        result.VerificationMethod.Should().Be(MudAdminVerificationMethod.Mssp);
        result.Instructions.Should().Contain("MSSP");
    }

    [Fact]
    public async Task Handle_MudNotFound_ReturnsNull()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _mudRepositoryMock.Setup(x => x.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Mud?)null);

        var command = new InitiateClaimCommand(mudId, userId, MudAdminVerificationMethod.Mssp);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_MudAlreadyClaimed_ReturnsNull()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var mud = new Mud { Id = mudId, Name = "Test MUD" };

        _mudRepositoryMock.Setup(x => x.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);
        _mudAdminRepositoryMock.Setup(x => x.IsMudClaimedAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var command = new InitiateClaimCommand(mudId, userId, MudAdminVerificationMethod.Mssp);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_UserHasPendingClaim_ReturnsNull()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var mud = new Mud { Id = mudId, Name = "Test MUD" };

        _mudRepositoryMock.Setup(x => x.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);
        _mudAdminRepositoryMock.Setup(x => x.IsMudClaimedAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _mudAdminRepositoryMock.Setup(x => x.HasPendingClaimAsync(userId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var command = new InitiateClaimCommand(mudId, userId, MudAdminVerificationMethod.Mssp);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WebsiteMetaTag_ReturnsCorrectInstructions()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var mud = new Mud { Id = mudId, Name = "Test MUD" };

        _mudRepositoryMock.Setup(x => x.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);
        _mudAdminRepositoryMock.Setup(x => x.IsMudClaimedAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _mudAdminRepositoryMock.Setup(x => x.HasPendingClaimAsync(userId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _mudAdminRepositoryMock.Setup(x => x.IsUserAdminOfMudAsync(userId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _mudAdminRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<MudAdminEntity>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((MudAdminEntity admin, CancellationToken _) => admin);

        var command = new InitiateClaimCommand(mudId, userId, MudAdminVerificationMethod.WebsiteMetaTag);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Instructions.Should().Contain("meta tag");
        result.VerificationMethod.Should().Be(MudAdminVerificationMethod.WebsiteMetaTag);
    }
}
