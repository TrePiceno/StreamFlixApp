namespace MoviesApp.Api.Models
{
    public class UsuarioFavorito
    {
        public int UsuarioFavoritoId { get; set; }
        public int UsuarioId { get; set; }
        public int ItemId { get; set; }
        public DateTime FechaAgregado { get; set; }

    }
}