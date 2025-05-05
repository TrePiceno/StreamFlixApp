import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Media } from '../shared/models/media.model';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private readonly localStorageKey = 'favoriteMediaIds';

  // Propiedad que almacena la lista de ids favoritos
  // BehaviorSubject se encarga de emitir el valor actual y los nuevos valores
  private favoriteIdsSubject = new BehaviorSubject<string[]>(
    this.loadFavoriteIds()
  );
  favoriteIds$: Observable<string[]> = this.favoriteIdsSubject.asObservable();

  constructor() { }

  // Método para cargar ids favoritos desde localStorage
  private loadFavoriteIds(): string[] {
    const idsJson = localStorage.getItem(this.localStorageKey);
    // Si existen ids en localStorage, los parsea y filtra para asegurarse de que son strings
    const ids = idsJson ? (JSON.parse(idsJson) as string[]).filter((id) => typeof id === 'string') : [];
    return ids;
  }

  // Método para guardar ids de los favoritos en el localStorage
  private saveFavoriteIds(): void {
      console.log('[FavoriteService] saveFavoriteIds called');
    const ids = this.favoriteIdsSubject.getValue();
    localStorage.setItem(this.localStorageKey, JSON.stringify(ids));
  }

  // Método para verificar si una película o serie esta en favoritos, si esta devuelve true, si no false
  isFavorite(mediaId: string): Observable<boolean> {
    return this.favoriteIds$.pipe(
      map((favoriteIds) => favoriteIds.includes(mediaId))
    );
  }

  // Método para añadir a favoritos
  addFavorite(mediaId: string): void {
    const currentIds = this.favoriteIdsSubject.getValue();
    // Si el ID no está ya en la lista, lo añade y guarda en localStorage
    if (!currentIds.includes(mediaId)) {
      const updatedIds = [...currentIds, mediaId];
      this.favoriteIdsSubject.next(updatedIds); 
      this.saveFavoriteIds(); 
    }
  }

  // Método para eliminar de favoritos
  removeFavorite(mediaId: string): void {
    const currentIds = this.favoriteIdsSubject.getValue();
    // Con filter eliminamos el ID de la lista
    const updatedIds = currentIds.filter((id) => id !== mediaId);
    // Actualizamos favoriteIdSibject solo si la lista ha cambiado y guardamos en localStorage la nueva lista
    if (updatedIds.length < currentIds.length) {
      this.favoriteIdsSubject.next(updatedIds);
      this.saveFavoriteIds(); 
    }
  }

  // Método para añaodir o eliminar de favoritos
  toggleFavorite(mediaId: string): void {
    const currentIds = this.favoriteIdsSubject.getValue();
    if (currentIds.includes(mediaId)) {
      this.removeFavorite(mediaId);
    } else {
      this.addFavorite(mediaId);
    }
  }

  // Método a usar en el componente FavoriteListComponent para obtener los favoritos y mostrarlos
  getFavoriteMedia(allMedia$: Observable<Media[]>): Observable<Media[]> {

    return combineLatest([ allMedia$, this.favoriteIds$,]).pipe(map(([allMedia, favoriteIds]) => {
        const filteredMedia = allMedia.filter((item) => favoriteIds.includes(item.id));

        return filteredMedia;
      })
    );
  }
}