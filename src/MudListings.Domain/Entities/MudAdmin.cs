using MudListings.Domain.Common;

namespace MudListings.Domain.Entities;

/// <summary>
/// Represents an ownership claim or admin relationship for a MUD.
/// </summary>
public class MudAdmin : BaseEntity
{
    public Guid MudId { get; set; }
    public Mud Mud { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public bool IsOwner { get; set; }
    public bool IsVerified { get; set; }

    public string? VerificationCode { get; set; }
    public MudAdminVerificationMethod? VerificationMethod { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public DateTime? InvitedAt { get; set; }
    public Guid? InvitedByUserId { get; set; }
    public User? InvitedByUser { get; set; }
}

public enum MudAdminVerificationMethod
{
    Mssp = 1,
    WebsiteMetaTag = 2,
    ManualApproval = 3
}
