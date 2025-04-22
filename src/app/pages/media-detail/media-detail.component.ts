import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, AsyncPipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MediaService } from '../../services/media.service';
import { FavoriteService } from '../../services/favorite.service';
import { Media } from '../../shared/models/media.model';
import { Observable, Subject, EMPTY, combineLatest, of } from 'rxjs';
import { switchMap, catchError, tap, finalize, map, filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-media-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe, TitleCasePipe],
  templateUrl: './media-detail.component.html',
  styleUrl: './media-detail.component.scss',
})
export class MediaDetailComponent implements OnInit, OnDestroy {
  // Propiedad que almacena el ítem individual
  mediaItem$!: Observable<Media | undefined>;

  // Propiedad que almacena el estado de favorito del ítem para alternar su estado
  isFavorite$!: Observable<boolean>;

  isLoading: boolean = false;
  errorMessage: string = '';

  // Propiedad para almacenar el ítem una vez cargado
  private currentMediaItem: Media | undefined;

  private destroy$ = new Subject<void>();

  // ActivatedRoute para trabajar con params y ChangeDetectorRef para detectar cambios en la vista
  constructor( private route: ActivatedRoute, private mediaService: MediaService, private favoriteService: FavoriteService, private router: Router, private cdr: ChangeDetectorRef ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = ''; 
    this.currentMediaItem = undefined;

    // Obtiene el Observable de parámetros de ruta
    this.mediaItem$ = this.route.paramMap.pipe(
      switchMap((params) => {
        // Obtiene el valor del parámetro 'id' como string
        const mediaId = params.get('id');
        // Verifica si el ID existe y no es nulo
        if (!mediaId) {
          this.errorMessage = 'ID de película/serie no proporcionado.';
          console.error('ID de película/serie no proporcionado:', mediaId);
          this.isLoading = false;
          this.currentMediaItem = undefined;
          return EMPTY;
        }

        // Llama al método getMediaItem del MediaService, pasando el ID (string)
        return this.mediaService.getMediaItem(mediaId).pipe(
          // Tap para ver el resultado de la búsqueda
          tap((item) => {
            this.currentMediaItem = item;
            if (!item) {
              // Si el servicio retorna undefined (no encontrado en la lista cargada)
              this.errorMessage = `Película/Serie con ID ${mediaId} no encontrada.`;
            }
          }),
          catchError((error) => {
            console.error( 'Error capturado al obtener detalle del ítem:', error );
            this.errorMessage = `Error al cargar el detalle: ${ error.message || 'Error desconocido' }`;
            this.currentMediaItem = undefined;
            this.isLoading = false;
            return EMPTY;
          }),
          // finalize: Se ejecuta cuando el Observable interno finaliza 
          finalize(() => {
            this.isLoading = false; 
            this.cdr.detectChanges(); // Detecta cambios en la vista para actualizar el estado de carga
          })
        );
      }),
      takeUntil(this.destroy$)
    );

    // determina si el ítem es favorito o no accediendo al servicio de favoritos y obteniendo su estado
    this.isFavorite$ = combineLatest([
      this.mediaItem$.pipe(filter((item) => item !== undefined)),
      this.favoriteService.favoriteIds$, 
    ]).pipe(
      map(([item, favoriteIds]) => {
        const isFav = favoriteIds.includes(item.id);
        return isFav;
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Método llamado al hacer clic en el botón de favorito en la página de detalle
  toggleFavorite(): void {
    if (this.currentMediaItem?.id !== undefined) {
      this.favoriteService.toggleFavorite(this.currentMediaItem.id);
    } else {
      console.warn(
        '[Detalle] No se pudo alternar favorito: Ítem no disponible.'
      );
    }
  }

  // Método para volver a la página anterior o a la lista principal
  goBack(): void {
    this.router.navigate(['/media']);
  }

}