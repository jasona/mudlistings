using FluentAssertions;
using Moq;
using MudListings.Application.Interfaces;
using MudListings.Application.MudAdmin.Commands;
using MudAdminEntity = MudListings.Domain.Entities.MudAdmin;

namespace MudListings.Tests.Application.MudAdmin;

public class RemoveAdminCommandTests
{
    private readonly Mock<IMudAdminRepository> _mudAdminRepositoryMock;
    private readonly RemoveAdminCommandHandler _handler;

    public RemoveAdminCommandTests()
    {
        _mudAdminRepositoryMock = new Mock<IMudAdminRepository>();
        _handler = new RemoveAdminCommandHandler(_mudAdminRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ValidRemoval_ReturnsSuccess()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var adminId = Guid.NewGuid();
        var adminToRemove = new MudAdminEntity
        {
            Id = adminId,
            MudId = mudId,
            IsOwner = false
        };

        _mudAdminRepositoryMock.Setup(x => x.IsUserOwnerOfMudAsync(ownerId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _mudAdminRepositoryMock.Setup(x => x.GetByIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminToRemove);
        _mudAdminRepositoryMock.Setup(x => x.DeleteAsync(adminId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new RemoveAdminCommand(mudId, adminId, ownerId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeTrue();
        result.Message.Should().Contain("removed");
        _mudAdminRepositoryMock.Verify(x => x.DeleteAsync(adminId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_NotOwner_ReturnsFailure()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var requesterId = Guid.NewGuid();
        var adminId = Guid.NewGuid();

        _mudAdminRepositoryMock.Setup(x => x.IsUserOwnerOfMudAsync(requesterId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var command = new RemoveAdminCommand(mudId, adminId, requesterId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("owner");
    }

    [Fact]
    public async Task Handle_AdminNotFound_ReturnsFailure()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var adminId = Guid.NewGuid();

        _mudAdminRepositoryMock.Setup(x => x.IsUserOwnerOfMudAsync(ownerId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _mudAdminRepositoryMock.Setup(x => x.GetByIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((MudAdminEntity?)null);

        var command = new RemoveAdminCommand(mudId, adminId, ownerId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task Handle_CannotRemoveOwner_ReturnsFailure()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var adminToRemove = new MudAdminEntity
        {
            Id = ownerId,
            MudId = mudId,
            IsOwner = true
        };

        _mudAdminRepositoryMock.Setup(x => x.IsUserOwnerOfMudAsync(ownerId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _mudAdminRepositoryMock.Setup(x => x.GetByIdAsync(ownerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminToRemove);

        var command = new RemoveAdminCommand(mudId, ownerId, ownerId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("owner");
    }
}
