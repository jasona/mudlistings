using MediatR;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Application.MudAdmin.Commands;

/// <summary>
/// Command to verify a pending claim.
/// </summary>
public record VerifyClaimCommand(
    Guid ClaimId,
    Guid UserId
) : IRequest<VerifyClaimResult>;

public record VerifyClaimResult(
    bool Success,
    string Message
);

public class VerifyClaimCommandHandler : IRequestHandler<VerifyClaimCommand, VerifyClaimResult>
{
    private readonly IMudAdminRepository _mudAdminRepository;
    private readonly IMudRepository _mudRepository;
    private readonly IMsspClient _msspClient;

    public VerifyClaimCommandHandler(
        IMudAdminRepository mudAdminRepository,
        IMudRepository mudRepository,
        IMsspClient msspClient)
    {
        _mudAdminRepository = mudAdminRepository;
        _mudRepository = mudRepository;
        _msspClient = msspClient;
    }

    public async Task<VerifyClaimResult> Handle(VerifyClaimCommand request, CancellationToken cancellationToken)
    {
        var claim = await _mudAdminRepository.GetPendingClaimAsync(request.ClaimId, cancellationToken);
        if (claim == null)
        {
            return new VerifyClaimResult(false, "Claim not found or already verified.");
        }

        if (claim.UserId != request.UserId)
        {
            return new VerifyClaimResult(false, "You are not authorized to verify this claim.");
        }

        var mud = await _mudRepository.GetByIdAsync(claim.MudId, cancellationToken);
        if (mud == null)
        {
            return new VerifyClaimResult(false, "MUD not found.");
        }

        // Manual approval doesn't need verification check
        if (claim.VerificationMethod == MudAdminVerificationMethod.ManualApproval)
        {
            return new VerifyClaimResult(false, "This claim requires manual approval by a site administrator.");
        }

        bool verified = false;
        string message;

        switch (claim.VerificationMethod)
        {
            case MudAdminVerificationMethod.Mssp:
                (verified, message) = await VerifyMsspAsync(mud, claim.VerificationCode!, cancellationToken);
                break;

            case MudAdminVerificationMethod.WebsiteMetaTag:
                (verified, message) = await VerifyWebsiteMetaTagAsync(mud, claim.VerificationCode!);
                break;

            default:
                return new VerifyClaimResult(false, "Unknown verification method.");
        }

        if (verified)
        {
            claim.IsVerified = true;
            claim.VerifiedAt = DateTime.UtcNow;
            await _mudAdminRepository.UpdateAsync(claim, cancellationToken);
            return new VerifyClaimResult(true, "Claim verified successfully! You are now the owner of this MUD listing.");
        }

        return new VerifyClaimResult(false, message);
    }

    private async Task<(bool Verified, string Message)> VerifyMsspAsync(Mud mud, string verificationCode, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _msspClient.GetStatusAsync(mud.Connection.Host, mud.Connection.Port, 10, cancellationToken);

            if (!result.IsOnline)
            {
                return (false, "Could not connect to your MUD server. Please ensure it is online and try again.");
            }

            // Check if the verification code exists in the MSSP data
            // The code should be in a custom field like "MUDLISTINGS"
            if (result.Data != null)
            {
                // For simplicity, we check if the GameName or any field contains the code
                // In a real implementation, you'd check a specific MSSP variable
                var msspDataJson = System.Text.Json.JsonSerializer.Serialize(result.Data);
                if (msspDataJson.Contains(verificationCode))
                {
                    return (true, "Verification code found in MSSP response!");
                }
            }

            return (false, $"Verification code '{verificationCode}' not found in MSSP response. " +
                          "Please add MUDLISTINGS variable with the code and try again.");
        }
        catch (Exception ex)
        {
            return (false, $"Error connecting to MUD server: {ex.Message}");
        }
    }

    private static async Task<(bool Verified, string Message)> VerifyWebsiteMetaTagAsync(Mud mud, string verificationCode)
    {
        if (string.IsNullOrEmpty(mud.Website))
        {
            return (false, "This MUD does not have a website URL configured. Please update the MUD listing with a website first.");
        }

        try
        {
            using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(10) };
            var response = await httpClient.GetStringAsync(mud.Website);

            // Look for the meta tag
            var metaTagPattern = $"<meta name=\"mudlistings-verification\" content=\"{verificationCode}\"";
            var metaTagPatternAlt = $"<meta content=\"{verificationCode}\" name=\"mudlistings-verification\"";

            if (response.Contains(metaTagPattern, StringComparison.OrdinalIgnoreCase) ||
                response.Contains(metaTagPatternAlt, StringComparison.OrdinalIgnoreCase))
            {
                return (true, "Verification meta tag found on website!");
            }

            return (false, $"Verification meta tag not found on {mud.Website}. " +
                          $"Please add <meta name=\"mudlistings-verification\" content=\"{verificationCode}\"> to your homepage.");
        }
        catch (Exception ex)
        {
            return (false, $"Error fetching website: {ex.Message}");
        }
    }
}
