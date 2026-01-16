using MediatR;
using MudListings.Application.DTOs.Muds;

namespace MudListings.Application.Muds.Queries;

public record GetMudBySlugQuery(string Slug, Guid? CurrentUserId = null) : IRequest<MudDetailDto?>;
