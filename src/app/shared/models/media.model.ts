export interface Media {
  id: string;
  titulo: string;
  imagen: string;
  imagenDetalle: string;
  sipnosis: string;
  anio: number;
  director: string;
  genero: string;
  categoria: 'pelicula' | 'serie';
}