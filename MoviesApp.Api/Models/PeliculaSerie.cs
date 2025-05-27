namespace MoviesApp.Api.Models
{
    public class PeliculaSerie
    {
        public int ItemId { get; set; }
        public string? Titulo { get; set; }
        public string? Imagen { get; set; }
        public string? ImagenDetalle { get; set; }
        public string? Sinopsis { get; set; }
        public int? Anio { get; set; }
        public string? Director { get; set; }
        public string? Genero { get; set; }
        public string? Categoria { get; set; }

        public bool EsFavorito { get; set; } = false;
    }
}