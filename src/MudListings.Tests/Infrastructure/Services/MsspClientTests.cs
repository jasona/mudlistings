using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using MudListings.Infrastructure.Services;

namespace MudListings.Tests.Infrastructure.Services;

public class MsspClientTests
{
    private readonly Mock<ILogger<MsspClient>> _loggerMock;
    private readonly MsspClient _client;

    public MsspClientTests()
    {
        _loggerMock = new Mock<ILogger<MsspClient>>();
        _client = new MsspClient(_loggerMock.Object);
    }

    [Fact]
    public async Task GetStatusAsync_WithInvalidHost_ShouldReturnOffline()
    {
        // Arrange
        var host = "nonexistent.invalid.host.test";
        var port = 4000;

        // Act
        var result = await _client.GetStatusAsync(host, port, timeoutSeconds: 2);

        // Assert
        result.IsOnline.Should().BeFalse();
        result.Data.Should().BeNull();
        result.ErrorMessage.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task GetStatusAsync_WithInvalidPort_ShouldReturnOffline()
    {
        // Arrange
        var host = "localhost";
        var port = 65535; // Unlikely to have a service running

        // Act
        var result = await _client.GetStatusAsync(host, port, timeoutSeconds: 2);

        // Assert
        result.IsOnline.Should().BeFalse();
    }

    [Fact]
    public async Task CheckTcpConnectionAsync_WithInvalidHost_ShouldReturnFalse()
    {
        // Arrange
        var host = "nonexistent.invalid.host.test";
        var port = 4000;

        // Act
        var result = await _client.CheckTcpConnectionAsync(host, port, timeoutSeconds: 2);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task GetStatusAsync_WithCancellation_ShouldReturnOffline()
    {
        // Arrange
        var host = "localhost";
        var port = 4000;
        using var cts = new CancellationTokenSource();
        cts.Cancel();

        // Act
        var result = await _client.GetStatusAsync(host, port, cancellationToken: cts.Token);

        // Assert
        result.IsOnline.Should().BeFalse();
    }
}
