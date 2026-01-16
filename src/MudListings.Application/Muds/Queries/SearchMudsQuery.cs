using MediatR;
using MudListings.Application.DTOs.Muds;

namespace MudListings.Application.Muds.Queries;

public record SearchMudsQuery(MudSearchParams SearchParams) : IRequest<MudSearchResultDto>;
