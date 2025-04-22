import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MediaService } from '../../services/media.service';
import { MediaFilterComponent } from '../../components/media-filter/media-filter.component'; 
import { MediaItemComponent } from '../../components/media-item/media-item.component';
import { BehaviorSubject, combineLatest, Observable, Subject, EMPTY } from 'rxjs';
import { map, takeUntil, catchError } from 'rxjs/operators';
import { Media } from '../../shared/models/media.model';

@Component({
  selector: 'app-media-list',
  standalone: true,
  imports: [CommonModule, MediaFilterComponent, MediaItemComponent, AsyncPipe],
  templateUrl: './media-list.component.html',
  styleUrl: './media-list.component.scss',
})
// Implementa OnInit y OnDestroy para gestionar suscripciones
export class MediaListComponent implements OnInit, OnDestroy {

  // Prpiedad para almacenar las listas filtradas (peliculas o series, además de los géneros)
  filteredMedia$!: Observable<Media[]>;

  isLoading$!: Observable<boolean>;
  errorMessage$!: Observable<string>;

  // Propiedad para almacenar los criterios de filtrado en un objeto
  private filterCriteriaSubject = new BehaviorSubject<any>( { categoria: '', genero: '' } );
  filterCriteria$ = this.filterCriteriaSubject.asObservable();

  private destroy$ = new Subject<void>();


  constructor( private mediaService: MediaService ) {}

  ngOnInit(): void {
    // Obtiene los Observables de estado de carga y error de mediaService
    this.isLoading$ = this.mediaService.isLoading$;
    this.errorMessage$ = this.mediaService.errorMessage$;

    // Combina dos Observables: la lista completa de media Y los criterios de filtro y emite su valor cuando cambian
    this.filteredMedia$ = combineLatest( [ this.mediaService.getMedia(), this.filterCriteria$ ]).pipe(
      // map: Recibe un array con los últimos valores de los Observables combinados ([lista, criterios])
      map(([allMedia, criteria]) => {
        // Llama a nuestro método privado para aplicar la lógica de filtrado
        return this.applyFilters(allMedia, criteria);
      }),
      catchError((error) => {
        console.error('Error en el pipe de filtrado/combinación:', error);
        return EMPTY; // Retorna Observable vacío para detener el flujo de datos
      }),
      // Usa takeUntil para limpiar la suscripción cuando el componente se destruye
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Método que se llama cuando el MediaFilterComponent emite nuevos criterios de filtro
  onFilterCriteriaChange(criteria: any): void {
    // Emite los nuevos criterios a través de nuestro BehaviorSubject interno
    this.filterCriteriaSubject.next(criteria); 
  }

  // Método con la lógica para filtrar la lista de media
  private applyFilters(allMedia: Media[], criteria: any): Media[] {
    // Si no hay media cargada, retorna un array vacío
    if (!allMedia) {
      return [];
    }

    let filtered = [...allMedia];

    // Aplicar filtro por Categoría ('pelicula' o 'serie')
    // Filtra solo si criteria.categoria NO es vacío
    if (criteria.categoria && criteria.categoria !== '') {
      filtered = filtered.filter(
        (item) => item.categoria === criteria.categoria
      );
    }

    // Aplicar filtro por Género
    // Filtra solo si criteria.genero NO es vacío
    if (criteria.genero && criteria.genero !== '') {
      filtered = filtered.filter((item) =>
        item.genero.toLowerCase().includes(criteria.genero.toLowerCase())
      );
    }

    return filtered;
  }

}