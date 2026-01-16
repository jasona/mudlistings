using FluentAssertions;
using Moq;
using MudListings.Application.Interfaces;
using MudListings.Application.MudAdmin.Commands;
using MudAdminEntity = MudListings.Domain.Entities.MudAdmin;

namespace MudListings.Tests.Application.MudAdmin;

public class TransferOwnershipCommandTests
{
    private readonly Mock<IMudAdminRepository> _mudAdminRepositoryMock;
    private readonly TransferOwnershipCommandHandler _handler;

    public TransferOwnershipCommandTests()
    {
        _mudAdminRepositoryMock = new Mock<IMudAdminRepository>();
        _handler = new TransferOwnershipCommandHandler(_mudAdminRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ValidTransfer_ReturnsSuccess()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var currentOwnerId = Guid.NewGuid();
        var newOwnerId = Guid.NewGuid();

        var currentOwner = new MudAdminEntity
        {
            Id = Guid.NewGuid(),
            MudId = mudId,
            UserId = currentOwnerId,
            IsOwner = true,
            IsVerified = true
        };

        var newOwner = new MudAdminEntity
        {
            Id = Guid.NewGuid(),
            MudId = mudId,
            UserId = newOwnerId,
            IsOwner = false,
            IsVerified = true
        };

        _mudAdminRepositoryMock.Setup(x => x.IsUserOwnerOfMudAsync(currentOwnerId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _mudAdminRepositoryMock.Setup(x => x.GetByUserAndMudAsync(currentOwnerId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentOwner);
        _mudAdminRepositoryMock.Setup(x => x.GetByUserAndMudAsync(newOwnerId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(newOwner);
        _mudAdminRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<MudAdminEntity>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new TransferOwnershipCommand(mudId, currentOwnerId, newOwnerId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeTrue();
        result.Message.Should().Contain("transferred");
        currentOwner.IsOwner.Should().BeFalse();
        newOwner.IsOwner.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_NotOwner_ReturnsFailure()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var requesterId = Guid.NewGuid();
        var newOwnerId = Guid.NewGuid();

        _mudAdminRepositoryMock.Setup(x => x.IsUserOwnerOfMudAsync(requesterId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var command = new TransferOwnershipCommand(mudId, requesterId, newOwnerId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("owner");
    }

    [Fact]
    public async Task Handle_NewOwnerNotAdmin_ReturnsFailure()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var currentOwnerId = Guid.NewGuid();
        var newOwnerId = Guid.NewGuid();

        var currentOwner = new MudAdminEntity
        {
            Id = Guid.NewGuid(),
            MudId = mudId,
            UserId = currentOwnerId,
            IsOwner = true
        };

        _mudAdminRepositoryMock.Setup(x => x.IsUserOwnerOfMudAsync(currentOwnerId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _mudAdminRepositoryMock.Setup(x => x.GetByUserAndMudAsync(currentOwnerId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentOwner);
        _mudAdminRepositoryMock.Setup(x => x.GetByUserAndMudAsync(newOwnerId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((MudAdminEntity?)null);

        var command = new TransferOwnershipCommand(mudId, currentOwnerId, newOwnerId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("existing verified admin");
    }

    [Fact]
    public async Task Handle_NewOwnerNotVerified_ReturnsFailure()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var currentOwnerId = Guid.NewGuid();
        var newOwnerId = Guid.NewGuid();

        var currentOwner = new MudAdminEntity
        {
            Id = Guid.NewGuid(),
            MudId = mudId,
            UserId = currentOwnerId,
            IsOwner = true
        };

        var newOwner = new MudAdminEntity
        {
            Id = Guid.NewGuid(),
            MudId = mudId,
            UserId = newOwnerId,
            IsOwner = false,
            IsVerified = false
        };

        _mudAdminRepositoryMock.Setup(x => x.IsUserOwnerOfMudAsync(currentOwnerId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _mudAdminRepositoryMock.Setup(x => x.GetByUserAndMudAsync(currentOwnerId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentOwner);
        _mudAdminRepositoryMock.Setup(x => x.GetByUserAndMudAsync(newOwnerId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(newOwner);

        var command = new TransferOwnershipCommand(mudId, currentOwnerId, newOwnerId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("existing verified admin");
    }

    [Fact]
    public async Task Handle_AlreadyOwner_ReturnsFailure()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var currentOwnerId = Guid.NewGuid();

        var currentOwner = new MudAdminEntity
        {
            Id = Guid.NewGuid(),
            MudId = mudId,
            UserId = currentOwnerId,
            IsOwner = true,
            IsVerified = true
        };

        _mudAdminRepositoryMock.Setup(x => x.IsUserOwnerOfMudAsync(currentOwnerId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _mudAdminRepositoryMock.Setup(x => x.GetByUserAndMudAsync(currentOwnerId, mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentOwner);

        var command = new TransferOwnershipCommand(mudId, currentOwnerId, currentOwnerId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("already the owner");
    }
}
