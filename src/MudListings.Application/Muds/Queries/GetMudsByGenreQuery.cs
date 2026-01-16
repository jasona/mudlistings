using MediatR;
using MudListings.Application.DTOs.Muds;
using MudListings.Domain.Enums;

namespace MudListings.Application.Muds.Queries;

public record GetMudsByGenreQuery(Genre Genre, int Limit = 10) : IRequest<IReadOnlyList<MudListDto>>;
