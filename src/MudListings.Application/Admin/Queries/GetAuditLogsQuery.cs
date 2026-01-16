using MediatR;
using MudListings.Application.DTOs.Admin;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Admin.Queries;

/// <summary>
/// Query to get audit logs.
/// </summary>
public record GetAuditLogsQuery(
    string? Action = null,
    Guid? UserId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    int Page = 1,
    int PageSize = 50
) : IRequest<AuditLogListDto>;

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, AuditLogListDto>
{
    private readonly IAdminRepository _adminRepository;

    public GetAuditLogsQueryHandler(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public async Task<AuditLogListDto> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        return await _adminRepository.GetAuditLogsAsync(
            request.Action,
            request.UserId,
            request.FromDate,
            request.ToDate,
            request.Page,
            request.PageSize,
            cancellationToken);
    }
}
