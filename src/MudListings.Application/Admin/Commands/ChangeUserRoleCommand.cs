using MediatR;
using Microsoft.AspNetCore.Identity;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Application.Admin.Commands;

/// <summary>
/// Command to change a user's role.
/// </summary>
public record ChangeUserRoleCommand(
    Guid UserId,
    string NewRole,
    Guid AdminUserId
) : IRequest<ChangeUserRoleResult>;

public record ChangeUserRoleResult(
    bool Success,
    string Message
);

public class ChangeUserRoleCommandHandler : IRequestHandler<ChangeUserRoleCommand, ChangeUserRoleResult>
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly IAdminRepository _adminRepository;

    private static readonly string[] ValidRoles = { "Player", "MudAdmin", "SiteAdmin" };

    public ChangeUserRoleCommandHandler(
        UserManager<User> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        IAdminRepository adminRepository)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _adminRepository = adminRepository;
    }

    public async Task<ChangeUserRoleResult> Handle(ChangeUserRoleCommand request, CancellationToken cancellationToken)
    {
        // Validate role
        if (!ValidRoles.Contains(request.NewRole))
        {
            return new ChangeUserRoleResult(false, $"Invalid role. Valid roles: {string.Join(", ", ValidRoles)}");
        }

        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null)
        {
            return new ChangeUserRoleResult(false, "User not found.");
        }

        // Prevent changing own role
        if (request.UserId == request.AdminUserId)
        {
            return new ChangeUserRoleResult(false, "You cannot change your own role.");
        }

        // Ensure role exists
        if (!await _roleManager.RoleExistsAsync(request.NewRole))
        {
            await _roleManager.CreateAsync(new IdentityRole<Guid>(request.NewRole));
        }

        // Get current roles
        var currentRoles = await _userManager.GetRolesAsync(user);

        // Remove from all current roles
        if (currentRoles.Count > 0)
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
            {
                return new ChangeUserRoleResult(false, "Failed to remove existing roles.");
            }
        }

        // Add to new role
        var addResult = await _userManager.AddToRoleAsync(user, request.NewRole);
        if (!addResult.Succeeded)
        {
            return new ChangeUserRoleResult(false, "Failed to assign new role.");
        }

        // Create audit log
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = "ChangeRole",
            UserId = request.AdminUserId,
            TargetType = "User",
            TargetId = request.UserId,
            Details = $"Changed role from [{string.Join(", ", currentRoles)}] to [{request.NewRole}] for user {user.Email}",
            CreatedAt = DateTime.UtcNow
        };

        await _adminRepository.CreateAuditLogAsync(auditLog, cancellationToken);

        return new ChangeUserRoleResult(true, $"User role changed to {request.NewRole}.");
    }
}
