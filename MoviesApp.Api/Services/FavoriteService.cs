using MoviesApp.Api.Data;
using MoviesApp.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace MoviesApp.Api.Services
{
    public class FavoriteService
    {
        private readonly UsuariosFavoritosRepository _usuariosFavoritosRepository;
        private readonly PeliculaSerieRepository _peliculaSerieRepository;

        public FavoriteService(UsuariosFavoritosRepository usuariosFavoritosRepository, PeliculaSerieRepository peliculaSerieRepository)
        {
            _usuariosFavoritosRepository = usuariosFavoritosRepository;
            _peliculaSerieRepository = peliculaSerieRepository;
        }

        public async Task<bool> AddFavoriteAsync(int userId, int itemId)
        {
            var itemExists = await _peliculaSerieRepository.GetByIdAsync(itemId) != null;
            if (!itemExists)
            {
                return false;
            }

            var isAlreadyFavorite = await _usuariosFavoritosRepository.IsFavoriteAsync(userId, itemId);
            if (isAlreadyFavorite)
            {
                return false;
            }

            try
            {
                await _usuariosFavoritosRepository.AddFavoriteAsync(userId, itemId);
                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }
        
        public async Task<bool> RemoveFavoriteAsync(int userId, int itemId)
        {
            return await _usuariosFavoritosRepository.RemoveFavoriteAsync(userId, itemId);
        }

        public async Task<IEnumerable<PeliculaSerie>> GetUserFavoritesAsync(int userId)
        {
            return await _usuariosFavoritosRepository.GetFavoritesByUserIdAsync(userId);
        }

    }
}