using MediatR;
using MudListings.Application.DTOs.MudAdmin;
using MudListings.Application.Interfaces;

namespace MudListings.Application.MudAdmin.Queries;

/// <summary>
/// Query to get all MUDs managed by a user.
/// </summary>
public record GetManagedMudsQuery(
    Guid UserId
) : IRequest<IReadOnlyList<ManagedMudDto>>;

public class GetManagedMudsQueryHandler : IRequestHandler<GetManagedMudsQuery, IReadOnlyList<ManagedMudDto>>
{
    private readonly IMudAdminRepository _mudAdminRepository;

    public GetManagedMudsQueryHandler(IMudAdminRepository mudAdminRepository)
    {
        _mudAdminRepository = mudAdminRepository;
    }

    public async Task<IReadOnlyList<ManagedMudDto>> Handle(GetManagedMudsQuery request, CancellationToken cancellationToken)
    {
        return await _mudAdminRepository.GetManagedMudsForUserAsync(request.UserId, cancellationToken);
    }
}
