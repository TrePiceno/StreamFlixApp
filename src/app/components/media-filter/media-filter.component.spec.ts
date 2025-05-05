import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MediaFilterComponent } from './media-filter.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { skip, take } from 'rxjs';

describe('MediaFilterComponent', () => {
  let component: MediaFilterComponent;
  let fixture: ComponentFixture<MediaFilterComponent>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [MediaFilterComponent, CommonModule, ReactiveFormsModule],
    }).compileComponents();

    // Inyectación de FormBuilder
    formBuilder = TestBed.inject(FormBuilder);

    fixture = TestBed.createComponent(MediaFilterComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

  });

  afterEach(() => {
    if (fixture && fixture.destroy) {
      fixture.destroy();
    }
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    // Verificar que el formulario y los filtros fue inicializado
    expect(component.filterForm instanceof FormGroup).toBeTrue();
    expect(component.filterForm.contains('categoria')).toBeTrue();
    expect(component.filterForm.contains('genero')).toBeTrue();
  });

  it('Deberia mostrar los selects de categoría y género', () => {
    const compiled = fixture.nativeElement;

    const categorySelect: HTMLSelectElement = compiled.querySelector('#categoria');
    expect(categorySelect).toBeTruthy();

    const categoryOptions: NodeListOf<HTMLOptionElement> = categorySelect.querySelectorAll('option');
    expect(categoryOptions.length).toBe(1 + component.categories.length);

    expect(categoryOptions[0].value).toBe('');
    expect(categoryOptions[0].textContent).toBe('Todos');

    // Espera las opciones de categoría restantes (con titlecase pipe)
    component.categories.forEach((cat, index) => {
      const optionIndex = index + 1; // +1 porque la opción "Todos" es el índice 0
      const option = categoryOptions[optionIndex];
      const expectedText = cat.charAt(0).toUpperCase() + cat.slice(1); // Simula titlecase pipe

      expect(option).toBeTruthy();
      expect(option.value).toBe(cat);
      expect(option.textContent).toBe(expectedText);
    });

    const genreSelect: HTMLSelectElement = compiled.querySelector('#genero');
    expect(genreSelect).toBeTruthy();

    const genreOptions: NodeListOf<HTMLOptionElement> = genreSelect.querySelectorAll('option');
    expect(genreOptions.length).toBe(1 + component.genres.length);

    expect(genreOptions[0].value).toBe('');
    expect(genreOptions[0].textContent).toBe('Todos');

    component.genres.forEach((g, index) => {
      const optionIndex = index + 1;
      const option = genreOptions[optionIndex];

      expect(option).toBeTruthy();
      expect(option.value).toBe(g,);
      expect(option.textContent).toBe(g);

    });
  });

  it('Deberia emitir el output filterCriteria con los valores del formulario', waitForAsync(() => {

    // Nos suscribimos al output del componente mediante pipe y subscribe en waitForAsync para esperar a que el debounceTime pase y dispare la emisión del output.
    component.filterCriteria
      .pipe(
        skip(1), // Salta la emisión inicial de startWith(this.filterForm.value) en ngOnInit
        take(1) // Espera solo la primera emisión después del skip
      )
      .subscribe(
        (criteria) => {
          expect(criteria).toEqual({ categoria: 'pelicula', genero: '' }); 
        },
        (error) => {
          fail('filterCriteria should not emit an error: ' + error);
        }
      );

    const compiled = fixture.nativeElement;
    const categorySelect: HTMLSelectElement = compiled.querySelector('#categoria');
    expect(categorySelect).toBeTruthy();

  }));

  it('Deberia emitir el output filterCriteria con los valores reseteados', waitForAsync(() => {
    const compiled = fixture.nativeElement;

    // Cambia los filtros a un estado por defecto
    component.filterForm.patchValue({
      categoria: 'pelicula',
      genero: 'Acción',
    });

    fixture.detectChanges(); 

    // Suscripción al output filterCriteria para esperar la emisión después del reset.
    // Usamos take(1) para esperar solo la primera emisión después del clic de reset.
    component.filterCriteria.pipe(take(1)).subscribe(
      (criteria) => {
        expect(criteria).toEqual({ categoria: '', genero: '' }); // Valor esperado
      },
      (error) => {
        fail('filterCriteria should not emit an error after reset: ' + error);
      }
    );

    const resetButton: HTMLButtonElement = compiled.querySelector('.filter-container > button');

    expect(resetButton).toBeTruthy();
    expect(resetButton.textContent).toContain('Resetear');

    // Simula el clic
    resetButton.click();

    fixture.detectChanges();

    // Espera que el output filterCriteria haya sido llamado con los valores por defecto.
    expect(component.filterForm.value).toEqual({
      categoria: '',
      genero: '',
    });

  })); 

});