using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace MoviesApp.Api.Helpers
{
    public class DataContext
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;

        public DataContext(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _connectionString = _configuration.GetConnectionString("DefaultConnection")
                                ?? throw new InvalidOperationException("La cadena de conexión 'DefaultConnection' no se encontró o está vacía en la configuración.");
        }

        public IDbConnection CreateConnection()
        {
            var connection = new SqlConnection(_connectionString);

            return connection;
        }

    }
}