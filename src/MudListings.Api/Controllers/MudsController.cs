using MediatR;
using Microsoft.AspNetCore.Mvc;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Interfaces;
using MudListings.Application.Muds.Queries;
using MudListings.Domain.Enums;

namespace MudListings.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MudsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public MudsController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Search and filter MUD listings.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(MudSearchResultDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search(
        [FromQuery] string? q = null,
        [FromQuery] string? genres = null,
        [FromQuery] bool? isOnline = null,
        [FromQuery] int? minPlayers = null,
        [FromQuery] int? maxPlayers = null,
        [FromQuery] double? minRating = null,
        [FromQuery] DateTime? createdAfter = null,
        [FromQuery] DateTime? createdBefore = null,
        [FromQuery] MudSortBy sortBy = MudSortBy.TrendingScore,
        [FromQuery] SortDirection sortDirection = SortDirection.Descending,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        // Parse genres from comma-separated string
        List<Genre>? genreList = null;
        if (!string.IsNullOrWhiteSpace(genres))
        {
            genreList = [];
            foreach (var genreStr in genres.Split(',', StringSplitOptions.RemoveEmptyEntries))
            {
                if (Enum.TryParse<Genre>(genreStr.Trim(), true, out var genre))
                {
                    genreList.Add(genre);
                }
            }
        }

        var searchParams = new MudSearchParams(
            Query: q,
            Genres: genreList,
            IsOnline: isOnline,
            MinPlayers: minPlayers,
            MaxPlayers: maxPlayers,
            MinRating: minRating,
            CreatedAfter: createdAfter,
            CreatedBefore: createdBefore,
            SortBy: sortBy,
            SortDirection: sortDirection,
            Page: page,
            PageSize: pageSize
        );

        var query = new SearchMudsQuery(searchParams);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    /// Get a MUD by ID or slug.
    /// </summary>
    [HttpGet("{idOrSlug}")]
    [ProducesResponseType(typeof(MudDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByIdOrSlug(string idOrSlug)
    {
        var currentUserId = _currentUserService.UserId;
        MudDetailDto? result;

        // Try to parse as GUID first
        if (Guid.TryParse(idOrSlug, out var id))
        {
            var query = new GetMudByIdQuery(id, currentUserId);
            result = await _mediator.Send(query);
        }
        else
        {
            // Treat as slug
            var query = new GetMudBySlugQuery(idOrSlug, currentUserId);
            result = await _mediator.Send(query);
        }

        if (result == null)
        {
            return NotFound(new { Message = "MUD not found." });
        }

        return Ok(result);
    }

    /// <summary>
    /// Get featured MUD listings.
    /// </summary>
    [HttpGet("featured")]
    [ProducesResponseType(typeof(IReadOnlyList<MudListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFeatured([FromQuery] int limit = 5)
    {
        var query = new GetFeaturedMudsQuery(Math.Min(limit, 20));
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    /// Get trending MUD listings.
    /// </summary>
    [HttpGet("trending")]
    [ProducesResponseType(typeof(IReadOnlyList<MudListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTrending([FromQuery] int limit = 10)
    {
        var query = new GetTrendingMudsQuery(Math.Min(limit, 50));
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    /// Get MUD listings by genre.
    /// </summary>
    [HttpGet("genre/{genre}")]
    [ProducesResponseType(typeof(IReadOnlyList<MudListDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetByGenre(string genre, [FromQuery] int limit = 10)
    {
        if (!Enum.TryParse<Genre>(genre, true, out var genreEnum))
        {
            return BadRequest(new { Message = $"Invalid genre: {genre}" });
        }

        var query = new GetMudsByGenreQuery(genreEnum, Math.Min(limit, 50));
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    /// Get autocomplete suggestions for MUD search.
    /// </summary>
    [HttpGet("autocomplete")]
    [ProducesResponseType(typeof(IReadOnlyList<AutocompleteSuggestionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAutocomplete([FromQuery] string q, [FromQuery] int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
        {
            return Ok(Array.Empty<AutocompleteSuggestionDto>());
        }

        var query = new GetAutocompleteQuery(q, Math.Min(limit, 20));
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    /// Get current status of a MUD.
    /// </summary>
    [HttpGet("{id:guid}/status")]
    [ProducesResponseType(typeof(MudCurrentStatusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStatus(Guid id)
    {
        var query = new GetMudStatusQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(new { Message = "MUD not found." });
        }

        return Ok(result);
    }

    /// <summary>
    /// Get status history of a MUD.
    /// </summary>
    [HttpGet("{id:guid}/status/history")]
    [ProducesResponseType(typeof(MudStatusHistoryResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStatusHistory(Guid id, [FromQuery] int hours = 24)
    {
        var query = new GetMudStatusHistoryQuery(id, Math.Clamp(hours, 1, 168)); // Max 7 days
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(new { Message = "MUD not found." });
        }

        return Ok(result);
    }
}
