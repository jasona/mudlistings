using FluentAssertions;
using Moq;
using MudListings.Application.Admin.Commands;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Tests.Application.Admin;

public class SetFeaturedCommandTests
{
    private readonly Mock<IAdminRepository> _adminRepositoryMock;
    private readonly Mock<IMudRepository> _mudRepositoryMock;
    private readonly SetFeaturedCommandHandler _handler;

    public SetFeaturedCommandTests()
    {
        _adminRepositoryMock = new Mock<IAdminRepository>();
        _mudRepositoryMock = new Mock<IMudRepository>();
        _handler = new SetFeaturedCommandHandler(
            _adminRepositoryMock.Object,
            _mudRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_FeatureMud_ReturnsSuccess()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var adminUserId = Guid.NewGuid();
        var mud = new Mud { Id = mudId, Name = "Test MUD" };

        _mudRepositoryMock.Setup(x => x.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);
        _adminRepositoryMock.Setup(x => x.SetMudFeaturedAsync(mudId, true, null, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _adminRepositoryMock.Setup(x => x.CreateAuditLogAsync(It.IsAny<AuditLog>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new SetFeaturedCommand(mudId, true, adminUserId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeTrue();
        result.Message.Should().Contain("added to featured");
    }

    [Fact]
    public async Task Handle_UnfeatureMud_ReturnsSuccess()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var adminUserId = Guid.NewGuid();
        var mud = new Mud { Id = mudId, Name = "Test MUD", IsFeatured = true };

        _mudRepositoryMock.Setup(x => x.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mud);
        _adminRepositoryMock.Setup(x => x.SetMudFeaturedAsync(mudId, false, null, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _adminRepositoryMock.Setup(x => x.CreateAuditLogAsync(It.IsAny<AuditLog>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new SetFeaturedCommand(mudId, false, adminUserId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeTrue();
        result.Message.Should().Contain("removed from featured");
    }

    [Fact]
    public async Task Handle_MudNotFound_ReturnsFailure()
    {
        // Arrange
        var mudId = Guid.NewGuid();
        var adminUserId = Guid.NewGuid();

        _mudRepositoryMock.Setup(x => x.GetByIdAsync(mudId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Mud?)null);

        var command = new SetFeaturedCommand(mudId, true, adminUserId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }
}
