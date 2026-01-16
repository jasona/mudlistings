using MediatR;
using Microsoft.AspNetCore.Mvc;
using MudListings.Application.DTOs.Muds;
using MudListings.Application.Muds.Queries;

namespace MudListings.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GenresController : ControllerBase
{
    private readonly IMediator _mediator;

    public GenresController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all genres with MUD counts.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<GenreDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGenres()
    {
        var query = new GetGenreStatsQuery();
        var result = await _mediator.Send(query);

        return Ok(result);
    }
}
