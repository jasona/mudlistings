using MediatR;
using MudListings.Application.DTOs.MudAdmin;
using MudListings.Application.Interfaces;

namespace MudListings.Application.MudAdmin.Queries;

/// <summary>
/// Query to get all admins for a MUD.
/// </summary>
public record GetMudAdminsQuery(
    Guid MudId,
    Guid RequestingUserId
) : IRequest<IReadOnlyList<MudAdminDto>?>;

public class GetMudAdminsQueryHandler : IRequestHandler<GetMudAdminsQuery, IReadOnlyList<MudAdminDto>?>
{
    private readonly IMudAdminRepository _mudAdminRepository;

    public GetMudAdminsQueryHandler(IMudAdminRepository mudAdminRepository)
    {
        _mudAdminRepository = mudAdminRepository;
    }

    public async Task<IReadOnlyList<MudAdminDto>?> Handle(GetMudAdminsQuery request, CancellationToken cancellationToken)
    {
        // Only admins can view the admin list
        var isAdmin = await _mudAdminRepository.IsUserAdminOfMudAsync(request.RequestingUserId, request.MudId, cancellationToken);
        if (!isAdmin) return null;

        return await _mudAdminRepository.GetAdminsForMudAsync(request.MudId, cancellationToken);
    }
}
