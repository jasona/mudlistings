using MediatR;
using MudListings.Application.DTOs.Muds;

namespace MudListings.Application.Muds.Queries;

public record GetFeaturedMudsQuery(int Limit = 5) : IRequest<IReadOnlyList<MudListDto>>;
