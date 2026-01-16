using FluentAssertions;
using MudListings.Domain.ValueObjects;

namespace MudListings.Tests.Domain.ValueObjects;

public class ConnectionInfoTests
{
    [Fact]
    public void Constructor_WithParameters_ShouldSetProperties()
    {
        // Arrange & Act
        var connectionInfo = new ConnectionInfo("testmud.com", 4000, "https://play.testmud.com");

        // Assert
        connectionInfo.Host.Should().Be("testmud.com");
        connectionInfo.Port.Should().Be(4000);
        connectionInfo.WebClientUrl.Should().Be("https://play.testmud.com");
    }

    [Fact]
    public void Constructor_WithoutWebClient_ShouldHaveNullWebClientUrl()
    {
        // Arrange & Act
        var connectionInfo = new ConnectionInfo("testmud.com", 4000);

        // Assert
        connectionInfo.Host.Should().Be("testmud.com");
        connectionInfo.Port.Should().Be(4000);
        connectionInfo.WebClientUrl.Should().BeNull();
    }

    [Fact]
    public void DefaultConstructor_ShouldHaveDefaultValues()
    {
        // Arrange & Act
        var connectionInfo = new ConnectionInfo();

        // Assert
        connectionInfo.Host.Should().BeEmpty();
        connectionInfo.Port.Should().Be(0);
        connectionInfo.WebClientUrl.Should().BeNull();
    }

    [Fact]
    public void ToConnectionString_ShouldReturnHostColonPort()
    {
        // Arrange
        var connectionInfo = new ConnectionInfo("testmud.com", 4000);

        // Act
        var connectionString = connectionInfo.ToConnectionString();

        // Assert
        connectionString.Should().Be("testmud.com:4000");
    }

    [Fact]
    public void Equality_WithSameValues_ShouldBeEqual()
    {
        // Arrange
        var conn1 = new ConnectionInfo("testmud.com", 4000, "https://play.testmud.com");
        var conn2 = new ConnectionInfo("testmud.com", 4000, "https://play.testmud.com");

        // Assert
        conn1.Should().Be(conn2);
        (conn1 == conn2).Should().BeTrue();
    }

    [Fact]
    public void Equality_WithDifferentHost_ShouldNotBeEqual()
    {
        // Arrange
        var conn1 = new ConnectionInfo("testmud.com", 4000);
        var conn2 = new ConnectionInfo("othermud.com", 4000);

        // Assert
        conn1.Should().NotBe(conn2);
    }

    [Fact]
    public void Equality_WithDifferentPort_ShouldNotBeEqual()
    {
        // Arrange
        var conn1 = new ConnectionInfo("testmud.com", 4000);
        var conn2 = new ConnectionInfo("testmud.com", 5000);

        // Assert
        conn1.Should().NotBe(conn2);
    }

    [Fact]
    public void Equality_WithDifferentWebClientUrl_ShouldNotBeEqual()
    {
        // Arrange
        var conn1 = new ConnectionInfo("testmud.com", 4000, "https://play1.testmud.com");
        var conn2 = new ConnectionInfo("testmud.com", 4000, "https://play2.testmud.com");

        // Assert
        conn1.Should().NotBe(conn2);
    }
}
