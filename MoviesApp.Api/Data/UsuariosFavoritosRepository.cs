using Dapper;
using MoviesApp.Api.Models;
using MoviesApp.Api.Helpers;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace MoviesApp.Api.Data
{
    public class UsuariosFavoritosRepository
    {
        private readonly DataContext _context;

        public UsuariosFavoritosRepository(DataContext context)
        {
            _context = context;
        }

        public async Task AddFavoriteAsync(int userId, int itemId)
        {
            var sql = @"
                INSERT INTO UsuariosFavoritos (UsuarioId, ItemId, FechaAgregado)
                VALUES (@UsuarioId, @ItemId, GETDATE())";

            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(sql, new { UsuarioId = userId, ItemId = itemId });
            }
        }

        public async Task<bool> RemoveFavoriteAsync(int userId, int itemId)
        {
            var sql = @"
                DELETE FROM UsuariosFavoritos
                WHERE UsuarioId = @UsuarioId AND ItemId = @ItemId";

            using (var connection = _context.CreateConnection())
            {
                var rowsAffected = await connection.ExecuteAsync(sql, new { UsuarioId = userId, ItemId = itemId });
                return rowsAffected > 0;
            }
        }

        public async Task<IEnumerable<PeliculaSerie>> GetFavoritesByUserIdAsync(int userId)
        {
            var sql = @"
                SELECT ps.*, CAST(1 AS BIT) AS EsFavorito -- Siempre es favorito en esta lista
                FROM UsuariosFavoritos uf
                JOIN PeliculasSeries ps ON uf.ItemId = ps.ItemId
                WHERE uf.UsuarioId = @UsuarioId";

            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<PeliculaSerie>(sql, new { UsuarioId = userId });
            }
        }

        public async Task<bool> IsFavoriteAsync(int userId, int itemId)
        {
            var sql = @"
                SELECT COUNT(1) FROM UsuariosFavoritos
                WHERE UsuarioId = @UsuarioId AND ItemId = @ItemId";

            using (var connection = _context.CreateConnection())
            {
                var count = await connection.ExecuteScalarAsync<int>(sql, new { UsuarioId = userId, ItemId = itemId });
                return count > 0;
            }
        }
    }
}