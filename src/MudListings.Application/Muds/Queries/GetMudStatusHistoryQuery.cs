using MediatR;
using MudListings.Application.DTOs.Muds;

namespace MudListings.Application.Muds.Queries;

public record GetMudStatusHistoryQuery(
    Guid MudId,
    int Hours = 24
) : IRequest<MudStatusHistoryResponseDto?>;
