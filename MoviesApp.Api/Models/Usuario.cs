namespace MoviesApp.Api.Models
{
    public class Usuario
    {
        public int UsuarioId { get; set; }
        public required string Username { get; set; }
        public required string PasswordHash { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}