using Dapper;
using MoviesApp.Api.Models;
using MoviesApp.Api.Helpers;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace MoviesApp.Api.Data
{
    public class PeliculaSerieRepository
    {
        private readonly DataContext _context;

        public PeliculaSerieRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PeliculaSerie>> GetAllAsync()
        {
            var sql = "SELECT * FROM PeliculasSeries";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<PeliculaSerie>(sql);
            }
        }

        public async Task<PeliculaSerie?> GetByIdAsync(int itemId)
        {
            var sql = "SELECT * FROM PeliculasSeries WHERE ItemId = @ItemId";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QuerySingleOrDefaultAsync<PeliculaSerie>(sql, new { ItemId = itemId });
            }
        }

        public async Task<IEnumerable<PeliculaSerie>> GetFilteredAsync(string? category, string? genre)
        {
            var sql = "SELECT * FROM PeliculasSeries WHERE (Categoria = @Category OR @Category IS NULL) AND (Genero = @Genre OR @Genre IS NULL)";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<PeliculaSerie>(sql, new { Category = category, Genre = genre });
            }
        }

        public async Task<IEnumerable<PeliculaSerie>> GetAllWithFavoriteStatusAsync(int? userId)
        {
            var sql = @"
        SELECT ps.*, CASE WHEN uf.UsuarioFavoritoId IS NOT NULL THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS EsFavorito
        FROM PeliculasSeries ps
        LEFT JOIN UsuariosFavoritos uf ON ps.ItemId = uf.ItemId AND uf.UsuarioId = @UserId";

            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<PeliculaSerie>(sql, new { UserId = userId });
            }
        }

        public async Task<IEnumerable<PeliculaSerie>> GetFilteredWithFavoriteStatusAsync(int? userId, string? category, string? genre)
        {
            var sql = @"
        SELECT ps.*, CASE WHEN uf.UsuarioFavoritoId IS NOT NULL THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS EsFavorito
        FROM PeliculasSeries ps
        LEFT JOIN UsuariosFavoritos uf ON ps.ItemId = uf.ItemId AND uf.UsuarioId = @UserId
        WHERE (ps.Categoria = @Category OR @Category IS NULL) AND (ps.Genero = @Genre OR @Genre IS NULL)";

            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<PeliculaSerie>(sql, new { UserId = userId, Category = category, Genre = genre });
            }
        }

        public async Task<PeliculaSerie?> GetByIdWithFavoriteStatusAsync(int? userId, int itemId)
        {
            var sql = @"
        SELECT ps.*, CASE WHEN uf.UsuarioFavoritoId IS NOT NULL THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS EsFavorito
        FROM PeliculasSeries ps
        LEFT JOIN UsuariosFavoritos uf ON ps.ItemId = uf.ItemId AND uf.UsuarioId = @UserId
        WHERE ps.ItemId = @ItemId";

            using (var connection = _context.CreateConnection())
            {
                return await connection.QuerySingleOrDefaultAsync<PeliculaSerie>(sql, new { UserId = userId, ItemId = itemId });
            }
        }

    }
}
