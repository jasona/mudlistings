using MediatR;
using MudListings.Application.DTOs.Muds;

namespace MudListings.Application.Muds.Queries;

public record GetTrendingMudsQuery(int Limit = 10) : IRequest<IReadOnlyList<MudListDto>>;
