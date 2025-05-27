using Dapper;
using MoviesApp.Api.Models;
using MoviesApp.Api.Helpers;

namespace MoviesApp.Api.Data
{
    public class UserRepository
    {
        private readonly DataContext _context;

        public UserRepository(DataContext context)
        {
            _context = context;
        }
        public async Task<Usuario?> GetByUsernameAsync(string username)
        {
            var sql = "SELECT * FROM Usuarios WHERE Username = @Username";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryFirstOrDefaultAsync<Usuario>(sql, new { Username = username });
            }
        }

        public async Task<int> CreateUserAsync(Usuario user)
        {
            var sql = @"
                INSERT INTO Usuarios (Username, PasswordHash, FechaCreacion)
                VALUES (@Username, @PasswordHash, @FechaCreacion);
                SELECT CAST(SCOPE_IDENTITY() as int);";
            using (var connection = _context.CreateConnection())
            {
                return await connection.ExecuteScalarAsync<int>(sql, user);
            }
        }

    }
}