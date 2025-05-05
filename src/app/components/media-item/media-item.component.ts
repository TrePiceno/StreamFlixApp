import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Media } from '../../shared/models/media.model';
import { FavoriteService } from '../../services/favorite.service';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-media-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media-item.component.html',
  styleUrl: './media-item.component.scss',
})

export class MediaItemComponent implements OnInit {

  // @Input() recibe el objeto Media del componente padre (media-list o favorite-list)
  @Input() item!: Media;

  // @Input() booleano para controlar si mostrar el botón de remover en lugar del de toggle en la vista de favoritos
  @Input() showRemoveButton: boolean = false;

  // @Output() para emitir el ID del ítem cuando se pide removerlo (solo si showRemoveButton es true)
  @Output() removedFromFavorites = new EventEmitter<string>();

  isFavorite$!: Observable<boolean>;

  constructor( private favoriteService: FavoriteService, private router: Router ) {}

  ngOnInit(): void {
    this.isFavorite$ = this.favoriteService.favoriteIds$.pipe(
      map((favoriteIds) => favoriteIds.includes(this.item.id)),

    );
  }

  // Método llamado al hacer clic en el botón/icono de favorito (en la lista principal)
  toggleFavorite(): void {
    if (!this.showRemoveButton && this.item?.id !== undefined) {
      // Llama directamente al método toggleFavorite del servicio
      this.favoriteService.toggleFavorite(this.item.id);
    }
  }

  // Este método emite el evento y el padre (FavoriteListComponent) abrirá el modal
  removeFromFavorites(): void {
    if (this.showRemoveButton && this.item?.id !== undefined) {
      this.removedFromFavorites.emit(this.item.id);
    }
  }

  // Método llamado al hacer clic en el ítem, para navegar al detalle
  goToDetail(): void {
    // Verifica que el ítem y su id existan antes de navegar
    if (this.item?.id !== undefined) {
      this.router.navigate(['/details', this.item.id]);
    } else {
      console.warn('[Item] No se pudo navegar a detalle: Ítem no disponible.');
    }
  }

}