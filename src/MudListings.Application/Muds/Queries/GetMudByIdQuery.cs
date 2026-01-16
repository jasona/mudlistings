using MediatR;
using MudListings.Application.DTOs.Muds;

namespace MudListings.Application.Muds.Queries;

public record GetMudByIdQuery(Guid Id, Guid? CurrentUserId = null) : IRequest<MudDetailDto?>;
