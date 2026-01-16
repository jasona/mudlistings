using MediatR;
using MudListings.Application.DTOs.Muds;

namespace MudListings.Application.Muds.Queries;

public record GetAutocompleteQuery(string Query, int Limit = 10) : IRequest<IReadOnlyList<AutocompleteSuggestionDto>>;
