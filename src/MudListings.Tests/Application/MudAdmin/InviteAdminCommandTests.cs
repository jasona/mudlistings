using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Moq;
using MudListings.Application.Interfaces;
using MudListings.Application.MudAdmin.Commands;
using MudListings.Domain.Entities;
using MudAdminEntity = MudListings.Domain.Entities.MudAdmin;

namespace MudListings.Tests.Application.MudAdmin;

public class InviteAdminCommandTests
{
    private readonly Mock<IMudAdminRepository> _mudAdminRepositoryMock;
    private readonly Mock<IMudRepository> _mudRepositoryMock;
    private readonly Mock<UserManager<User>> _userManagerMock;
    private readonly InviteAdminCommandHandler _handler;

    public InviteAdminCommandTests()
    {
        _mudAdminRepositoryMock = new Mock<IMudAdminRepository>();
        _mudRepositoryMock = new Mock<IMudRepository>();
        _userManagerMock = new Mock<UserManager<User>>(
            Mock.Of<IUserStore<User>>(), null!, null!, null!, null!, null!, null!, null!, null!);
        _handler = new InviteAdminCommandHandler(
            _mudAdminRepositoryMock.Object,
            _mudRepositoryMock.Object,
            _userManagerMock.Object);
    }

    [Fact]
    public async Task Handle_ValidInvite_ReturnsSuccess()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var inviterId = Guid.NewGuid();
        var inviteeId = Guid.NewGuid();
        var inviteeEmail = "invitee@example.com";
        var invitee = new User { Id = inviteeId, Email = inviteeEmail, DisplayName = "Invitee" };

        _mudAdminRepositoryMock.Setup(x => x.IsUserOwnerOfMudAsync(inviterId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _userManagerMock.Setup(x => x.FindByEmailAsync(inviteeEmail))
            .ReturnsAsync(invitee);
        _mudAdminRepositoryMock.Setup(x => x.GetByUserAndMudAsync(inviteeId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((MudAdminEntity?)null);
        _mudAdminRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<MudAdminEntity>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((MudAdminEntity admin, CancellationToken _) => admin);

        var command = new InviteAdminCommand(mudId, inviterId, inviteeEmail);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeTrue();
        result.InviteId.Should().NotBeNull();
        result.Message.Should().Contain("Invitee");
    }

    [Fact]
    public async Task Handle_NotOwner_ReturnsFailure()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var inviterId = Guid.NewGuid();

        _mudAdminRepositoryMock.Setup(x => x.IsUserOwnerOfMudAsync(inviterId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var command = new InviteAdminCommand(mudId, inviterId, "invitee@example.com");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("owner");
    }

    [Fact]
    public async Task Handle_UserNotFound_ReturnsFailure()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var inviterId = Guid.NewGuid();

        _mudAdminRepositoryMock.Setup(x => x.IsUserOwnerOfMudAsync(inviterId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _userManagerMock.Setup(x => x.FindByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync((User?)null);

        var command = new InviteAdminCommand(mudId, inviterId, "notfound@example.com");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task Handle_AlreadyAdmin_ReturnsFailure()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var inviterId = Guid.NewGuid();
        var inviteeId = Guid.NewGuid();
        var invitee = new User { Id = inviteeId, Email = "invitee@example.com" };
        var existingAdmin = new MudAdminEntity { IsVerified = true };

        _mudAdminRepositoryMock.Setup(x => x.IsUserOwnerOfMudAsync(inviterId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _userManagerMock.Setup(x => x.FindByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync(invitee);
        _mudAdminRepositoryMock.Setup(x => x.GetByUserAndMudAsync(inviteeId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingAdmin);

        var command = new InviteAdminCommand(mudId, inviterId, "invitee@example.com");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("already an admin");
    }
}
