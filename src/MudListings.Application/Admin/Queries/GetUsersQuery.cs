using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MudListings.Application.DTOs.Admin;
using MudListings.Domain.Entities;

namespace MudListings.Application.Admin.Queries;

/// <summary>
/// Query to get users for admin management.
/// </summary>
public record GetUsersQuery(
    string? SearchTerm = null,
    string? Role = null,
    int Page = 1,
    int PageSize = 20
) : IRequest<AdminUserListDto>;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, AdminUserListDto>
{
    private readonly UserManager<User> _userManager;

    public GetUsersQueryHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<AdminUserListDto> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _userManager.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(u =>
                u.Email!.ToLower().Contains(term) ||
                u.DisplayName.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = new List<AdminUserDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var isLockedOut = await _userManager.IsLockedOutAsync(user);

            // Filter by role if specified
            if (!string.IsNullOrWhiteSpace(request.Role) && !roles.Contains(request.Role))
            {
                continue;
            }

            items.Add(new AdminUserDto(
                user.Id,
                user.Email!,
                user.DisplayName,
                user.AvatarUrl,
                user.EmailConfirmed,
                roles.ToList(),
                user.CreatedAt,
                user.LastLoginAt,
                isLockedOut
            ));
        }

        return new AdminUserListDto(items, totalCount, request.Page, request.PageSize);
    }
}
