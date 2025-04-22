import { Component, OnInit, OnDestroy } from '@angular/core'; 
import { CommonModule, AsyncPipe } from '@angular/common';
import { MediaService } from '../../services/media.service';
import { FavoriteService } from '../../services/favorite.service';
import { MediaItemComponent } from '../../components/media-item/media-item.component';
import { Observable, Subject, EMPTY } from 'rxjs';
import { takeUntil, catchError, tap, take, filter, map, concatMap } from 'rxjs/operators';
import { Media } from '../../shared/models/media.model';
import { DialogService } from '../../shared/services/dialog.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-favorite-list',
  standalone: true,
  imports: [CommonModule, MediaItemComponent, AsyncPipe],
  templateUrl: './favorite-list.component.html',
  styleUrl: './favorite-list.component.scss',
})

export class FavoriteListComponent implements OnInit, OnDestroy {
  // Propiedad para almacenar la lista de favoritos
  favoriteMedia$!: Observable<Media[]>;

  isLoading$!: Observable<boolean>;
  errorMessage$!: Observable<string>;

  private destroy$ = new Subject<void>();

  constructor( private mediaService: MediaService, private favoriteService: FavoriteService, private dialogService: DialogService, private dialog: MatDialog ) {}

  ngOnInit(): void {
    // Obtiene los Observables de estado de carga y error del MediaService
    this.isLoading$ = this.mediaService.isLoading$;
    this.errorMessage$ = this.mediaService.errorMessage$;

    // Guarda los favoritos del FavoriteService en la propiedad favoriteMedia$ que es un Observable.
    // Le pasa el Observable de TODOS los ítems del MediaService.
    this.favoriteMedia$ = this.favoriteService.getFavoriteMedia(this.mediaService.media$).pipe(tap((mediaList) => {}), takeUntil(this.destroy$), catchError((error) => {
          return EMPTY;
        })
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Método llamado por el MediaItemComponent hijo cuando se pide remover un ítem y abrir el modal
  onRemoveFavorite(mediaId: string): void {

    // Si hay un modal abierto, no se abrirá otro
    if (this.dialog.openDialogs.length > 0) {
      console.log(
        '[FavoriteList] Ya hay diálogos abiertos. Ignorando solicitud de remover.'
      );
      return;
    }

    // Obtiene el item por su ID para usar su título en el mensaje del modal
    this.mediaService
      .getMediaItem(mediaId)
      .pipe(
        take(1),
        filter((item) => item !== undefined),
        concatMap((item) => {
          const message = `¿Estás seguro de que deseas eliminar "${item.titulo}" de tus favoritos?`;
          // Abre el modal y retorna el Observable que emite el resultado
          return this.dialogService.openConfirmationDialog(message).pipe(
            map((dialogResult) => ({ item, dialogResult }))
          );
        }),
        // Filtramos para continuar SOLO si el resultado del diálogo fue 'true'
        filter(({ dialogResult }) => dialogResult === true)
      )
      .subscribe(({ item }) => {
        // Si el subscribe se ejecuta, significa que el diálogo se confirmó
        // Llama al método removeFavorite del FavoriteService
        this.favoriteService.removeFavorite(item.id);
      });
  }
}