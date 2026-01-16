using MediatR;
using MudListings.Application.DTOs.MudAdmin;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Application.MudAdmin.Commands;

/// <summary>
/// Command to initiate a claim on a MUD.
/// </summary>
public record InitiateClaimCommand(
    Guid MudId,
    Guid UserId,
    MudAdminVerificationMethod VerificationMethod
) : IRequest<ClaimInitiationDto?>;

public class InitiateClaimCommandHandler : IRequestHandler<InitiateClaimCommand, ClaimInitiationDto?>
{
    private readonly IMudAdminRepository _mudAdminRepository;
    private readonly IMudRepository _mudRepository;

    public InitiateClaimCommandHandler(IMudAdminRepository mudAdminRepository, IMudRepository mudRepository)
    {
        _mudAdminRepository = mudAdminRepository;
        _mudRepository = mudRepository;
    }

    public async Task<ClaimInitiationDto?> Handle(InitiateClaimCommand request, CancellationToken cancellationToken)
    {
        // Verify MUD exists
        var mud = await _mudRepository.GetByIdAsync(request.MudId, cancellationToken);
        if (mud == null) return null;

        // Check if MUD is already claimed
        var isClaimed = await _mudAdminRepository.IsMudClaimedAsync(request.MudId, cancellationToken);
        if (isClaimed) return null;

        // Check if user already has a pending claim
        var hasPendingClaim = await _mudAdminRepository.HasPendingClaimAsync(request.UserId, request.MudId, cancellationToken);
        if (hasPendingClaim) return null;

        // Check if user is already an admin
        var isAdmin = await _mudAdminRepository.IsUserAdminOfMudAsync(request.UserId, request.MudId, cancellationToken);
        if (isAdmin) return null;

        // Generate verification code
        var verificationCode = GenerateVerificationCode();

        var claim = new Domain.Entities.MudAdmin
        {
            Id = Guid.NewGuid(),
            MudId = request.MudId,
            UserId = request.UserId,
            IsOwner = true,
            IsVerified = false,
            VerificationCode = verificationCode,
            VerificationMethod = request.VerificationMethod,
            CreatedAt = DateTime.UtcNow
        };

        await _mudAdminRepository.CreateAsync(claim, cancellationToken);

        var instructions = GetVerificationInstructions(request.VerificationMethod, verificationCode, mud.Name);

        return new ClaimInitiationDto(
            claim.Id,
            verificationCode,
            request.VerificationMethod,
            instructions
        );
    }

    private static string GenerateVerificationCode()
    {
        // Generate a unique code like "MUDL-XXXX-XXXX"
        var random = new Random();
        var part1 = random.Next(1000, 9999);
        var part2 = random.Next(1000, 9999);
        return $"MUDL-{part1}-{part2}";
    }

    private static string GetVerificationInstructions(MudAdminVerificationMethod method, string code, string mudName)
    {
        return method switch
        {
            MudAdminVerificationMethod.Mssp =>
                $"Add the following verification code to your MUD's MSSP response under the 'MUDLISTINGS' variable: {code}. " +
                $"Once added, click verify and we will check your MSSP response.",

            MudAdminVerificationMethod.WebsiteMetaTag =>
                $"Add the following meta tag to your MUD's website homepage: " +
                $"<meta name=\"mudlistings-verification\" content=\"{code}\">. " +
                $"Once added, click verify and we will check your website.",

            MudAdminVerificationMethod.ManualApproval =>
                $"Your claim request for {mudName} has been submitted for manual review. " +
                $"A site administrator will verify your ownership and approve your claim. Reference code: {code}",

            _ => "Unknown verification method."
        };
    }
}
