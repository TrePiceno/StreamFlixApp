import { ComponentFixture, TestBed } from '@angular/core/testing'; 
import { MediaItemComponent } from './media-item.component';
import { FavoriteService } from '../../services/favorite.service';
import { Router } from '@angular/router'; 
import { Media } from '../../shared/models/media.model';
import { BehaviorSubject } from 'rxjs'; 
import { CommonModule } from '@angular/common'; 
import { By } from '@angular/platform-browser';

describe('MediaItemComponent', () => {
  let component: MediaItemComponent;
  let fixture: ComponentFixture<MediaItemComponent>;
  
  let favoriteServiceMock: jasmine.SpyObj<FavoriteService>;
  let routerMock: jasmine.SpyObj<Router>;

  // BehaviorSubject mockeado para simular favoriteIds$ del servicio
  let favoriteIdsSubjectMock: BehaviorSubject<string[]>;

  // Mock de Media para usar como input (@Input item)
  const mockMediaItem: Media = {
    id: 'test-media-1',
    titulo: 'Mock Movie Title',
    categoria: 'pelicula',
    genero: 'accion',
    imagen: 'mock-movie.jpg',
    imagenDetalle: 'mock-movie-detail.jpg',
    anio: 2024,
    sipnosis: 'This is a mock synopsis.',
    director: 'Mock Director',
  };

  beforeEach(async () => {
    //  Inicialización del mock de favoriteIds$
    favoriteIdsSubjectMock = new BehaviorSubject<string[]>([]);

    // SpyObjs para los servicios
    favoriteServiceMock = jasmine.createSpyObj('FavoriteService', [
      'isFavorite',
      'toggleFavorite',
    ]);

    // MediaItemComponent usa router.navigate()
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    // Mocke del servicio de favoritos usando un objeto parcial
    const favoriteServicePartialMock = {
      favoriteIds$: favoriteIdsSubjectMock.asObservable(),
      toggleFavorite: jasmine.createSpy('toggleFavorite'),
    };

    // Configuración del espía de favoriteService
    favoriteServiceMock = favoriteServicePartialMock as jasmine.SpyObj<FavoriteService>;

    // Configuración del espía de router
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [MediaItemComponent, CommonModule], 
      providers: [
        { provide: FavoriteService, useValue: favoriteServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents(); 

    fixture = TestBed.createComponent(MediaItemComponent);
    component = fixture.componentInstance; 
    // Asignar el valor al @Input item
    component.item = mockMediaItem;

  });

  it('should be created', () => {
    // Verificar que el componente se cree y que las dependencias se inyecten correctamente
    expect(component).toBeTruthy();
    expect(TestBed.inject(FavoriteService)).toBe(favoriteServiceMock);
    expect(TestBed.inject(Router)).toBe(routerMock);
  });

  it('Deberia mostar todos los elementos del item', () => {
    // Inicialización del componente con el mock de MediaItem
    component.item = { ...mockMediaItem }; // spread para crear una copia y evitar modificar el mock original

    fixture.detectChanges();

    // Obtener el DOM compilado
    const compiled = fixture.nativeElement;

    // Espera el título y el año
    const titleElement: HTMLElement = compiled.querySelector('.media-title');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain(mockMediaItem.titulo);
    expect(titleElement.textContent).toContain(`(${mockMediaItem.anio})`);

    // Espera la categoría
    const categoryElement: HTMLElement = compiled.querySelector('.media-category');
    expect(categoryElement).toBeTruthy();
    // pipe titlecase convierte la primera letra a mayúscula
    const expectedCategory =
      mockMediaItem.categoria.charAt(0).toUpperCase() +
      mockMediaItem.categoria.slice(1);
    expect(categoryElement.textContent).toContain(expectedCategory);

    // Espera el género
    const genreElement: HTMLElement = compiled.querySelector('.media-genre');
    expect(genreElement).toBeTruthy();
    expect(genreElement.textContent).toContain(mockMediaItem.genero);

    // Espera la imagen src y alt
    const imgElement: HTMLImageElement = compiled.querySelector('img');
    expect(imgElement).toBeTruthy();
    expect(imgElement.alt).toBe(mockMediaItem.titulo);
  });

  it('Debería actualizar el estado de favorito', () => {
    const compiled = fixture.nativeElement;

    // Espera que el item no sea favorito
    const containerElement: HTMLElement = compiled.querySelector(
      '.media-item-container'
    );
    expect(containerElement).toBeTruthy();
    expect(containerElement.classList).not.toContain('is-favorite');

    const mediaActionsDiv: HTMLElement =
      compiled.querySelector('.media-actions');
    expect(mediaActionsDiv).toBeTruthy();

    // Cambia el estado: seteamos un id en favoriteIds$
    // Revisar más adelente, algo no esta bien aquí
    favoriteIdsSubjectMock.next(['']);
    fixture.detectChanges();

    const favoriteButton = mediaActionsDiv.querySelector('button');
    expect(favoriteButton).toBeTruthy();
    expect(favoriteButton!.textContent).toContain('🤍');

    favoriteIdsSubjectMock.next([mockMediaItem.id]);

    fixture.detectChanges();
    expect(containerElement.classList).toContain('is-favorite');

    const updatedMediaActionsDiv: HTMLElement =
      compiled.querySelector('.media-actions');
    const updatedFavoriteButton =
      updatedMediaActionsDiv.querySelector('button');
    expect(updatedFavoriteButton).toBeTruthy();
    expect(updatedFavoriteButton!.textContent).toContain('❤️');
    expect(updatedFavoriteButton!.textContent).not.toContain('🤍');
  });

  it('Deberia emitir el evento removedFromFavorites cuando se hace click en el botón de remover', () => {

    // @Input() showRemoveButton a true para mostrar el botón de remover
    component.showRemoveButton = true;
    fixture.detectChanges(); 

    // Espera que el botón de toggle no está visible y el de remover sí.
    const favoriteToggleDebugElement = fixture.debugElement.query(By.css('.media-actions button:not(.remove-button)'));
    const removeButtonDebugElement = fixture.debugElement.query(By.css('.media-actions .remove-button'));
    expect(favoriteToggleDebugElement).toBeNull();
    expect(removeButtonDebugElement).toBeTruthy();

    // Espia el EventEmitter @Output() removedFromFavorites.
    const removedFromFavoritesSpy = spyOn(component.removedFromFavorites, 'emit');

    // imula un evento de clic en el botón de remover.
    removeButtonDebugElement!.triggerEventHandler('click', null);

    fixture.detectChanges();

    // Espera que el EventEmitter fue llamado con el ID correcto.
    expect(removedFromFavoritesSpy).toHaveBeenCalledTimes(1);
    expect(removedFromFavoritesSpy).toHaveBeenCalledWith(mockMediaItem.id);

  });

  it('Debería navegar a la pantalla de detalles al hacer clic en el contenedor', () => {

    const containerDebugElement = fixture.debugElement.query(By.css('.media-item-container'));
    expect(containerDebugElement).toBeTruthy();

    // Espera que el Router no haya sido llamado inicialmente.
    expect(routerMock.navigate).not.toHaveBeenCalled();

    // Simula un clic en el contenedor
    containerDebugElement!.triggerEventHandler('click', null);

    fixture.detectChanges();

    // Espera que el Router haya sido llamado con la URL correcta y pasando el ID del item
    const expectedNavigationUrl = ['/details', mockMediaItem.id];
    expect(routerMock.navigate).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(expectedNavigationUrl);

  });

}); 
