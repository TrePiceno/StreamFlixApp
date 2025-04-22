import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-media-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './media-filter.component.html',
  styleUrl: './media-filter.component.scss',
})
export class MediaFilterComponent implements OnInit, OnDestroy {
  
  // FormGroup para manejar el formulario de filtros
  filterForm!: FormGroup;

  // @Output() para emitir los criterios de filtro al componente padre (MediaListComponent)
  @Output() filterCriteria = new EventEmitter<any>();

  private destroy$ = new Subject<void>();

  // Opciones para los select de categoría y género (ejemplos)
  categories: string[] = ['pelicula', 'serie'];
  genres: string[] = [ 'Comedia', 'Acción', 'Ciencia ficción', 'Drama','Thriller' ];

  constructor(private fb: FormBuilder) {};

  ngOnInit(): void {
    // Inicializa el formulario de filtros con los controles para categoría y género
    this.filterForm = this.fb.group({
      categoria: [''],
      genero: [''],
    });

    // Suscripción a los cambios en el formulario
    this.filterForm.valueChanges.pipe( startWith(this.filterForm.value), debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((criteria) => {
        // Cuando los criterios cambian, emite el valor del formulario
        this.filterCriteria.emit(criteria);
      });
  };

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  };

  // Método para resetear los filtros
  resetFilters(): void {
    this.filterForm.reset({ categoria: '', genero: '' });
  };

}
