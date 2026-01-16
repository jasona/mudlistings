using MediatR;
using MudListings.Application.DTOs.Muds;

namespace MudListings.Application.Muds.Queries;

public record GetGenreStatsQuery : IRequest<IReadOnlyList<GenreDto>>;
