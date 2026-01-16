using FluentAssertions;
using MudListings.Domain.ValueObjects;

namespace MudListings.Tests.Domain.ValueObjects;

public class MsspDataTests
{
    [Fact]
    public void Parse_WithValidData_ShouldCreateMsspData()
    {
        // Arrange
        var rawData = new Dictionary<string, string>
        {
            { "NAME", "Test MUD" },
            { "PLAYERS", "42" },
            { "UPTIME", "1234567" },
            { "CODEBASE", "Custom" },
            { "CONTACT", "admin@testmud.com" },
            { "WEBSITE", "https://testmud.com" },
            { "LANGUAGE", "en" },
            { "LOCATION", "US" },
            { "FAMILY", "DikuMUD" }
        };

        // Act
        var msspData = MsspData.Parse(rawData);

        // Assert
        msspData.GameName.Should().Be("Test MUD");
        msspData.Players.Should().Be(42);
        msspData.Uptime.Should().Be(1234567);
        msspData.Codebase.Should().Be("Custom");
        msspData.Contact.Should().Be("admin@testmud.com");
        msspData.Website.Should().Be("https://testmud.com");
        msspData.Language.Should().Be("en");
        msspData.Location.Should().Be("US");
        msspData.Family.Should().Be("DikuMUD");
    }

    [Fact]
    public void Parse_WithWWWKey_ShouldUseAsWebsite()
    {
        // Arrange
        var rawData = new Dictionary<string, string>
        {
            { "NAME", "Test MUD" },
            { "WWW", "https://testmud.com" }
        };

        // Act
        var msspData = MsspData.Parse(rawData);

        // Assert
        msspData.Website.Should().Be("https://testmud.com");
    }

    [Fact]
    public void Parse_WithWebsiteAndWWW_ShouldPreferWebsite()
    {
        // Arrange
        var rawData = new Dictionary<string, string>
        {
            { "NAME", "Test MUD" },
            { "WEBSITE", "https://primary.com" },
            { "WWW", "https://secondary.com" }
        };

        // Act
        var msspData = MsspData.Parse(rawData);

        // Assert
        msspData.Website.Should().Be("https://primary.com");
    }

    [Fact]
    public void Parse_WithProtocols_ShouldExtractProtocolList()
    {
        // Arrange
        var rawData = new Dictionary<string, string>
        {
            { "NAME", "Test MUD" },
            { "ANSI", "1" },
            { "UTF-8", "1" },
            { "MXP", "1" },
            { "MCCP", "0" },
            { "MSP", "1" },
            { "SSL", "0" }
        };

        // Act
        var msspData = MsspData.Parse(rawData);

        // Assert
        msspData.Protocols.Should().HaveCount(4);
        msspData.Protocols.Should().Contain("ANSI");
        msspData.Protocols.Should().Contain("UTF-8");
        msspData.Protocols.Should().Contain("MXP");
        msspData.Protocols.Should().Contain("MSP");
        msspData.Protocols.Should().NotContain("MCCP");
        msspData.Protocols.Should().NotContain("SSL");
    }

    [Fact]
    public void Parse_WithInvalidNumericValues_ShouldReturnNull()
    {
        // Arrange
        var rawData = new Dictionary<string, string>
        {
            { "NAME", "Test MUD" },
            { "PLAYERS", "invalid" },
            { "UPTIME", "not-a-number" }
        };

        // Act
        var msspData = MsspData.Parse(rawData);

        // Assert
        msspData.Players.Should().BeNull();
        msspData.Uptime.Should().BeNull();
    }

    [Fact]
    public void Parse_WithEmptyData_ShouldReturnEmptyMsspData()
    {
        // Arrange
        var rawData = new Dictionary<string, string>();

        // Act
        var msspData = MsspData.Parse(rawData);

        // Assert
        msspData.GameName.Should().BeNull();
        msspData.Players.Should().BeNull();
        msspData.Uptime.Should().BeNull();
        msspData.Protocols.Should().BeEmpty();
    }

    [Fact]
    public void Parse_ShouldSetReceivedAtToUtcNow()
    {
        // Arrange
        var rawData = new Dictionary<string, string>
        {
            { "NAME", "Test MUD" }
        };
        var beforeParse = DateTime.UtcNow;

        // Act
        var msspData = MsspData.Parse(rawData);
        var afterParse = DateTime.UtcNow;

        // Assert
        msspData.ReceivedAt.Should().BeOnOrAfter(beforeParse);
        msspData.ReceivedAt.Should().BeOnOrBefore(afterParse);
    }

    [Fact]
    public void DefaultConstructor_ShouldCreateEmptyMsspData()
    {
        // Arrange & Act
        var msspData = new MsspData();

        // Assert
        msspData.GameName.Should().BeNull();
        msspData.Players.Should().BeNull();
        msspData.Protocols.Should().BeEmpty();
    }
}
