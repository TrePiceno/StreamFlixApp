using Microsoft.AspNetCore.Mvc;
using MoviesApp.Api.Services;
using MoviesApp.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

[ApiController]
[Route("api/[controller]")]
public class CatalogController : ControllerBase
{
    private readonly CatalogService _catalogService;

    public CatalogController(CatalogService catalogService)
    {
        _catalogService = catalogService;
    }

    private int? GetUserIdFromHeaders()
    {
        if (Request.Headers.TryGetValue("X-UserId", out var userIdHeader) && int.TryParse(userIdHeader, out int userId))
        {
            return userId;
        }
        return null;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PeliculaSerie>>> GetCatalog(
        [FromQuery] string? category,
        [FromQuery] string? genre)
    {
        var userId = GetUserIdFromHeaders();

        var items = await _catalogService.GetCatalogAsync(userId, category, genre);

        if (items == null || !items.Any())
        {
            return Ok(Enumerable.Empty<PeliculaSerie>());
        }

        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PeliculaSerie>> GetItemDetails(int id)
    {
        var userId = GetUserIdFromHeaders();

        var item = await _catalogService.GetItemDetailsAsync(userId, id);

        if (item == null)
        {
            return NotFound(new { message = $"Item con ID {id} no encontrado." });
        }

        return Ok(item);
    }
}