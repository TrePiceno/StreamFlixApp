import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; 
import { BehaviorSubject, Observable, throwError } from 'rxjs'; 
import { catchError, finalize, tap, map, filter, take } from 'rxjs/operators';
import { Media } from '../shared/models/media.model';

// Definición de interfaz para la estructura del JSON
interface MediaJsonData {
  peliculas: Media[];
  series: Media[];
}

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private mediaUrl = 'assets/media.json';

  // En esta propiedad se almacenará la lista de peliculas y series
  private mediaSubject = new BehaviorSubject<Media[]>([]);
  media$: Observable<Media[]> = this.mediaSubject.asObservable();

  // Estado de carga y error de la carga inicial del JSON
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  private errorMessageSubject = new BehaviorSubject<string>('');
  errorMessage$ = this.errorMessageSubject.asObservable();

  // Inyección para realizar peticiones HTTP
  constructor(private http: HttpClient) {
    // Al iniciar, se cargan las películas y series desde el JSON
    this.loadMedia();
  };

  private loadMedia(): void {
    // Cambia el estado de carga a true y limpia el mensaje de error
    this.isLoadingSubject.next(true); 
    this.errorMessageSubject.next('');

    // Realiza la petición GET al archivo JSON.
    this.http
      .get<MediaJsonData>(this.mediaUrl)
      .pipe(
        tap((data) => {
          const allMedia: Media[] = [...data.peliculas, ...data.series];

          // Aqui se manda la lista completa de media a la propiedad mediaSubject
          this.mediaSubject.next(allMedia); 
        }),
        catchError((error) => this.handleError(error)),
        finalize(() => {
          this.isLoadingSubject.next(false); 
        })
      )
      .subscribe();
  }

  // Método público para que los componentes obtengan el Observable de la lista completa de media
  getMedia(): Observable<Media[]> {
    return this.media$;
  }

  // Método a usar para la vista de detalle de una película o serie
  getMediaItem(id: string): Observable<Media | undefined> {
    return this.media$.pipe(
      map((allMedia) => allMedia.find((item) => item.id === id)),
      filter((item) => item !== undefined),
      take(1)
    );
  }

  // Método para manejar errores HTTP para la carga del JSON
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = `Error al cargar el archivo JSON de media: ${
      error.status
    } ${error.statusText || ''}`;
    console.error('Información del error: ', error);
    this.errorMessageSubject.next(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
