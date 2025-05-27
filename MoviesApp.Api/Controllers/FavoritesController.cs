using Microsoft.AspNetCore.Mvc;
using MoviesApp.Api.Services;
using MoviesApp.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

public class AddFavoriteRequest
{
    public int UserId { get; set; }
    public int ItemId { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class FavoritesController : ControllerBase
{
    private readonly FavoriteService _favoriteService;

    public FavoritesController(FavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    [HttpGet("{userId:int}")]
    public async Task<ActionResult<IEnumerable<PeliculaSerie>>> GetUserFavorites(int userId)
    {
        var favorites = await _favoriteService.GetUserFavoritesAsync(userId);

        if (favorites == null)
        {
            return NotFound(new { message = $"Favoritos para el usuario con ID {userId} no encontrados." });
        }

        return Ok(favorites);
    }

    [HttpPost]
    public async Task<IActionResult> AddFavorite([FromBody] AddFavoriteRequest request)
    {
        if (request.UserId <= 0 || request.ItemId <= 0)
        {
            return BadRequest(new { message = "UserId e ItemId son requeridos y deben ser positivos." });
        }

        var added = await _favoriteService.AddFavoriteAsync(request.UserId, request.ItemId);

        if (!added)
        {
            return Conflict(new { message = "El ítem ya es favorito para este usuario o el ítem no existe." });
        }

        return CreatedAtAction(nameof(GetUserFavorites), new { userId = request.UserId }, new { message = "Ítem añadido a favoritos con éxito." });
    }

    [HttpDelete("{userId:int}/{itemId:int}")]
    public async Task<IActionResult> RemoveFavorite(int userId, int itemId)
    {
        if (userId <= 0 || itemId <= 0)
        {
            return BadRequest(new { message = "UserId e ItemId son requeridos y deben ser positivos." });
        }

        var removed = await _favoriteService.RemoveFavoriteAsync(userId, itemId);

        if (!removed)
        {
            return NotFound(new { message = "El ítem no se encontró en la lista de favoritos de este usuario." });
        }

        return Ok(new { message = "Ítem eliminado de favoritos con éxito." });
    }
}