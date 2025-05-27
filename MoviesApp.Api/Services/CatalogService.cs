using MoviesApp.Api.Data;
using MoviesApp.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MoviesApp.Api.Services
{
    public class CatalogService
    {
        private readonly PeliculaSerieRepository _peliculaSerieRepository;

        public CatalogService(PeliculaSerieRepository peliculaSerieRepository)
        {
            _peliculaSerieRepository = peliculaSerieRepository;
        }

        public async Task<IEnumerable<PeliculaSerie>> GetCatalogAsync(int? userId, string? category = null, string? genre = null)
        {
            return await _peliculaSerieRepository.GetFilteredWithFavoriteStatusAsync(userId, category, genre);
        }

        public async Task<PeliculaSerie?> GetItemDetailsAsync(int? userId, int itemId)
        {
            return await _peliculaSerieRepository.GetByIdWithFavoriteStatusAsync(userId, itemId);
        }
    }
}