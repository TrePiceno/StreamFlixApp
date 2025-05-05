import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MediaDetailComponent } from './media-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MediaService } from '../../services/media.service';
import { FavoriteService } from '../../services/favorite.service';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule, AsyncPipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError} from 'rxjs';
import { Media } from '../../shared/models/media.model';

// Mock de Media
const mockMediaItem: Media = {
  id: 'p1',
  titulo: 'Mock Movie 1',
  categoria: 'pelicula',
  genero: 'accion',
  imagen: 'img/p1.jpg',
  imagenDetalle: 'img/p1_detail.jpg',
  anio: 2020,
  sipnosis: 'Sipnosis de Mock Movie 1',
  director: 'Director 1',
};

describe('MediaDetailComponent', () => {
  let component: MediaDetailComponent;
  let fixture: ComponentFixture<MediaDetailComponent>;

  // Declarar variables para los mocks de servicios
  let paramMapSubject: Subject<any>; // Variable para el Subject que será el paramMap
  let mediaServiceMock: jasmine.SpyObj<MediaService>;
  let favoriteServiceMock: jasmine.SpyObj<FavoriteService>;
  let routerMock: jasmine.SpyObj<Router>;
  let changeDetectorRefMock: jasmine.SpyObj<ChangeDetectorRef>;

  // BehaviorSubjects mockeados
  let favoriteIdsSubjectMock: BehaviorSubject<string[]>;

  // Selectores para elementoscondicionales
  const loadingIndicatorSelector = '.test-loading-indicator'; 
  const errorDivSelector = '.test-error-message'; 
  const detailContainerSelector = '.detail-container';
  const notFoundMessageSelector = '.test-not-found-message';
  const mediaDetailContentSelector = '.media-detail-content'; 

  beforeEach(async () => {

    // Subjects/BehaviorSubjects mockeados
    favoriteIdsSubjectMock = new BehaviorSubject<string[]>([]);
    paramMapSubject = new Subject<any>();

    // SpyObjs para los servicios
    mediaServiceMock = jasmine.createSpyObj('MediaService', ['getMediaItem']);
    favoriteServiceMock = jasmine.createSpyObj(
      'FavoriteService',
      ['toggleFavorite'],
      ['favoriteIds$']
    );
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    changeDetectorRefMock = jasmine.createSpyObj('ChangeDetectorRef', [
      'detectChanges',
    ]);

    // Simula un objeto ActivatedRoute con una propiedad paramMap que es el Subject
    const activatedRouteMock = { paramMap: paramMapSubject.asObservable()};

    // Configura FavoriteService.favoriteIds$ propiedad Observable
    Object.defineProperty(favoriteServiceMock, 'favoriteIds$', {
      value: favoriteIdsSubjectMock.asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [
        MediaDetailComponent,
        CommonModule,
        RouterLink,
        AsyncPipe,
        TitleCasePipe,
      ],
      providers: [
        // Proveemos el mock de ActivatedRoute creado inline
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: MediaService, useValue: mediaServiceMock },
        { provide: FavoriteService, useValue: favoriteServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {

    if (fixture && fixture.destroy) {
      fixture.destroy(); // Limpiar recursos del componente y suscripciones
    }
    // Completa los Subjects/BehaviorSubjects mockeados al final de cada test
    paramMapSubject.complete(); 
    favoriteIdsSubjectMock.complete();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();

    // isLoading es true inicialmente. Sin mensaje personalizado
    expect(component.isLoading).toBeTrue();

    // errorMessage vacío inicialmente
    expect(component.errorMessage).toBe('');
  });

  it('Deberia mostrar solo el indicador de carga al inicio', () => {
    const compiled = fixture.nativeElement;

    const loadingElement = compiled.querySelector(loadingIndicatorSelector);
    expect(loadingElement).toBeTruthy();

    const loadingParagraph = loadingElement
      ? loadingElement.querySelector('p')
      : null;
    expect(loadingParagraph).toBeTruthy();
    expect(loadingParagraph!.textContent).toContain('Cargando detalles...');

    const errorElement = compiled.querySelector(errorDivSelector);
    expect(errorElement).toBeNull();

    const detailContainer = compiled.querySelector(detailContainerSelector);
    expect(detailContainer).toBeNull();
  });

  it('Deberia mostrar los detalles del media item después de un fetch exitoso', fakeAsync(() => {
    const compiled = fixture.nativeElement;
    const testItemId = mockMediaItem.id;

    mediaServiceMock.getMediaItem.and.returnValue(of(mockMediaItem));

    // Simula que ActivatedRoute emite un parámetro 'id'.
    // Usamos el Subject paramMapSubject directamente para emitir.
    // Emite un objeto que simula un ParamMap.
    paramMapSubject.next({
      get: (name: string) => (name === 'id' ? testItemId : null),
      has: (name: string) => name === 'id',
      getAll: (name: string) => (name === 'id' ? [testItemId] : []),
      keys: ['id'],
    });

    tick(); // Procesa la emisión de paramMap y la llamada a getMediaItem
    tick(); // Resuelve el observable retornado por getMediaItem (of())
    fixture.detectChanges(); // Actualizar la vista

    // Espera false del indicador de carga y vacío del mensaje de error
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('');

    // Espera elementos renderizados
    const detailContainer = compiled.querySelector(detailContainerSelector);
    expect(detailContainer).toBeTruthy();

    // La sección .test-not-found-message no debería ser visible
    const notFoundMessageElement = detailContainer ? detailContainer.querySelector(notFoundMessageSelector) : null;
    expect(notFoundMessageElement).toBeNull();

    // La sección .media-detail-content debería ser visible
    const mediaDetailContent = detailContainer ? detailContainer.querySelector(mediaDetailContentSelector) : null;
    expect(mediaDetailContent).toBeTruthy();

    expect(mediaServiceMock.getMediaItem).toHaveBeenCalledTimes(1);
    expect(mediaServiceMock.getMediaItem).toHaveBeenCalledWith(testItemId);

  }));

  it('Deberia mostrar un mensaje de error si el media item no se encuentra', fakeAsync(() => {
    const compiled = fixture.nativeElement;
    const testItemId = 'id-inextistente'; // Un ID que no existirá
    const expectedErrorMessage = `Película/Serie con ID ${testItemId} no encontrada.`;

    mediaServiceMock.getMediaItem.and.returnValue(of(undefined));

    paramMapSubject.next({
      get: (name: string) => (name === 'id' ? testItemId : null),
      has: (name: string) => name === 'id',
      getAll: (name: string) => (name === 'id' ? [testItemId] : []),
      keys: ['id'],
    });

    tick();
    tick();
    fixture.detectChanges();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe(expectedErrorMessage); 

    const loadingElement = compiled.querySelector(loadingIndicatorSelector);
    expect(loadingElement).toBeNull(); 

    const errorElement = compiled.querySelector(errorDivSelector);
    expect(errorElement).toBeTruthy();

    const errorParagraph = errorElement ? errorElement.querySelector('p') : null;
    expect(errorParagraph).toBeTruthy();
    expect(errorParagraph!.textContent).toContain(expectedErrorMessage);

  }));

  it('Deberia mostrar un mensaje de error si la llamada a la API falla', fakeAsync(() => {
    console.log('Test: "display error message" executed.');
    const compiled = fixture.nativeElement;
    const testItemId = mockMediaItem.id;
    const testError = new Error('Simulated API error');

    mediaServiceMock.getMediaItem.and.returnValue(throwError(() => testError));

    paramMapSubject.next({
      get: (name: string) => (name === 'id' ? testItemId : null),
      has: (name: string) => name === 'id',
      getAll: (name: string) => (name === 'id' ? [testItemId] : []),
      keys: ['id'],
    });

    tick();
    tick();
    fixture.detectChanges();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toContain('Error al cargar el detalle');
    expect(component.errorMessage).toContain(testError.message);

    const loadingElement = compiled.querySelector(loadingIndicatorSelector);
    expect(loadingElement).toBeNull();

    const errorElement = compiled.querySelector(errorDivSelector);
    expect(errorElement).toBeTruthy();
    const errorParagraph = errorElement ? errorElement.querySelector('p') : null;
    expect(errorParagraph).toBeTruthy();
    expect(errorParagraph!.textContent).toContain('Error al cargar el detalle');
    expect(errorParagraph!.textContent).toContain(testError.message);

  }));

  it('Deberia llamar a toggleFavorite() cuando se hace click en el botón de favorito', fakeAsync(() => {
    const compiled = fixture.nativeElement;
    const testItemId = mockMediaItem.id;

    mediaServiceMock.getMediaItem.and.returnValue(of(mockMediaItem));

    paramMapSubject.next({
      get: (name: string) => (name === 'id' ? testItemId : null),
      has: (name: string) => name === 'id',
      getAll: (name: string) => (name === 'id' ? [testItemId] : []),
      keys: ['id'],
    });
    tick();
    tick();
    fixture.detectChanges();

    // Obtiene el contenedor del detalle
    const detailContainer = compiled.querySelector(detailContainerSelector);
    let mediaDetailContent: HTMLElement | null = null;
    if (detailContainer) {
      mediaDetailContent = detailContainer.querySelector(
        mediaDetailContentSelector
      );
    }
    expect(mediaDetailContent).toBeTruthy();

    // Obtiene el botón de favorito en el DOM.
    let favButton: HTMLButtonElement | null = null;
    if (mediaDetailContent) {
      favButton = mediaDetailContent.querySelector('button');
      expect(favButton).toBeTruthy();
    } else {
      fail('Media detail content was not found');
    }

    // Simula un clic en el botón de favorito.
    favButton!.click(); // Dispara el evento click

    // Espera que favoriteService.toggleFavorite fue llamado con el ID correcto.
    expect(favoriteServiceMock.toggleFavorite).toHaveBeenCalledTimes(1);
    expect(favoriteServiceMock.toggleFavorite).toHaveBeenCalledWith(testItemId);
  }));

  it('Deberia navegar hacia la ruta /media', () => {

    component.goBack();

    expect(routerMock.navigate).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/media']);
  });

});