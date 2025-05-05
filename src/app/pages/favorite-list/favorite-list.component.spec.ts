import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoriteListComponent } from './favorite-list.component'; 
import { MediaService } from '../../services/media.service'; 
import { FavoriteService } from '../../services/favorite.service'; 
import { DialogService } from '../../shared/services/dialog.service'; 
import { MatDialog } from '@angular/material/dialog';
import { CommonModule, AsyncPipe } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs'; 
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Media } from '../../shared/models/media.model';
import { By } from '@angular/platform-browser';

// Stub para MediaItemComponent
@Component({
  selector: 'app-media-item',
  template: '',
  standalone: true,
})

class MediaItemStubComponent {
  @Input() item!: any;
  @Input() showRemoveButton: boolean = false;
  @Output() removedFromFavorites = new EventEmitter<string>();
}

const mockMediaList: Media[] = [
  {
    id: 'p1',
    titulo: 'Mock Movie 1',
    categoria: 'pelicula',
    genero: 'accion',
    imagen: '',
    imagenDetalle: '',
    anio: 2020,
    sipnosis: '',
    director: '',
  },
  {
    id: 's1',
    titulo: 'Mock Series 1',
    categoria: 'serie',
    genero: 'drama',
    imagen: '',
    imagenDetalle: '',
    anio: 2021,
    sipnosis: '',
    director: '',
  },
  {
    id: 'p2',
    titulo: 'Mock Movie 2',
    categoria: 'pelicula',
    genero: 'comedia',
    imagen: '',
    imagenDetalle: '',
    anio: 2022,
    sipnosis: '',
    director: '',
  },
];

// Mock de favoritos
const mockFavoriteList: Media[] = [mockMediaList[0], mockMediaList[2]];

describe('FavoriteListComponent (Basic Scenarios)', () => {
  let component: FavoriteListComponent;
  let fixture: ComponentFixture<FavoriteListComponent>;

  // Variables para los mocks de servicios
  let mediaServiceMock: jasmine.SpyObj<MediaService>;
  let favoriteServiceMock: jasmine.SpyObj<FavoriteService>;
  let dialogServiceMock: jasmine.SpyObj<DialogService>;
  let matDialogMock: jasmine.SpyObj<MatDialog>;

  // BehaviorSubjects mockeados para controlar el estado de los servicios
  let mediaSubjectMock: BehaviorSubject<Media[]>;
  let isLoadingSubjectMock: BehaviorSubject<boolean>;
  let errorMessageSubjectMock: BehaviorSubject<string>; 
  let favoriteMediaSubjectMock: BehaviorSubject<Media[]>;

  // --- Selectores para elementos condicionales
  const loadingIndicatorSelector = '.test-loading-indicator';
  const errorDivSelector = '.test-error-message';
  const favoriteListContainerSelector = '.favorite-list-container';
  const emptyListMessageSelector = '.test-empty-list-message';
  const mediaGridSelector = '.test-media-grid';

  beforeEach(async () => {
    // Inicialización  de BehaviorSubjects mockeados
    mediaSubjectMock = new BehaviorSubject<Media[]>([]);
    isLoadingSubjectMock = new BehaviorSubject<boolean>(false);
    errorMessageSubjectMock = new BehaviorSubject<string>('');

    // SpyObjs para los servicios
    mediaServiceMock = jasmine.createSpyObj(
      'MediaService',
      ['getMedia', 'getMediaItem'],
      ['media$', 'isLoading$', 'errorMessage$']
    );

    favoriteServiceMock = jasmine.createSpyObj('FavoriteService', [
      'getFavoriteMedia',
      'removeFavorite',
    ]);

    dialogServiceMock = jasmine.createSpyObj('DialogService', [
      'openConfirmationDialog',
    ]);

    matDialogMock = jasmine.createSpyObj('MatDialog', [], ['openDialogs']); // spyOn the openDialogs property (need to define it below)

    // Configuración de los mocks para que retornen los Observables/valores correctos
    Object.defineProperty(mediaServiceMock, 'media$', {
      value: mediaSubjectMock.asObservable(),
    });

    Object.defineProperty(mediaServiceMock, 'isLoading$', {
      value: isLoadingSubjectMock.asObservable(),
    });

    Object.defineProperty(mediaServiceMock, 'errorMessage$', {
      value: errorMessageSubjectMock.asObservable(),
    });

    // El mock retorna el Subject
    mediaServiceMock.getMedia.and.returnValue(mediaSubjectMock.asObservable());

    // El mock retorna el Subject
    favoriteMediaSubjectMock = new BehaviorSubject<Media[]>([]);
    favoriteServiceMock.getFavoriteMedia.and.returnValue(favoriteMediaSubjectMock.asObservable()); 

    // Mockear el retorno de dialogService.openConfirmationDialog como un Observable que emite true por defecto
    dialogServiceMock.openConfirmationDialog.and.returnValue(of(true));

    // Configurar MatDialog.openDialogs property como un array vacío para simular que no hay modales abiertos
    Object.defineProperty(matDialogMock, 'openDialogs', { value: [] });

    await TestBed.configureTestingModule({
      imports: [FavoriteListComponent, CommonModule, AsyncPipe],
      providers: [
        { provide: MediaService, useValue: mediaServiceMock },
        { provide: FavoriteService, useValue: favoriteServiceMock },
        { provide: DialogService, useValue: dialogServiceMock },
        { provide: MatDialog, useValue: matDialogMock }, 
      ],
    })
      .overrideComponent(FavoriteListComponent, {
        set: {
          imports: [
            CommonModule,
            AsyncPipe,
            MediaItemStubComponent,
          ],
        },
      })
      .compileComponents();

    // instancia del componente y su fixture
    fixture = TestBed.createComponent(FavoriteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // defineProperty se encarga de simular la propiedad openDialogs del MatDialog
    Object.defineProperty(matDialogMock, 'openDialogs', {
      value: [],
      writable: true,
    });

  });

  afterEach(() => {
    // Limpiar recursos del componente después de cada test
    if (fixture && fixture.destroy) {
      fixture.destroy();
    }
    // Completa los BehaviorSubjects mockeados al final de cada test
    mediaSubjectMock.complete();
    isLoadingSubjectMock.complete();
    errorMessageSubjectMock.complete();
    favoriteMediaSubjectMock.complete();

  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('Deberia mostrar que no hay favoritos inicialmente', () => {
    const compiled = fixture.nativeElement;

    // Contenedor principal de la lista
    const initialFavoriteListContainer = compiled.querySelector(favoriteListContainerSelector);
    expect(initialFavoriteListContainer).toBeTruthy();

    // Espera el mensaje vacío usando el selector específico
    const initialEmptyListMessage = initialFavoriteListContainer ? initialFavoriteListContainer.querySelector(emptyListMessageSelector) : null;
    expect(initialEmptyListMessage).toBeTruthy();

    // Espera el párrafo dentro del contenedor de mensaje vacío usando el selector específico
    const initialEmptyListParagraph = initialEmptyListMessage ? initialEmptyListMessage.querySelector('p') : null;
    expect(initialEmptyListParagraph).toBeTruthy();
    expect(initialEmptyListParagraph!.textContent).toContain('Aún no tienes películas o series favoritas.');

  });

  it('Deberia mostrar el indicador de carga mientras se cargan los favoritos', () => {
    const compiled = fixture.nativeElement;

    // Simula inicio de carga desde MediaService
    isLoadingSubjectMock.next(true);
    fixture.detectChanges();

    // Espera que el indicador de carga ES visible
    const loadingElementDuringLoad = compiled.querySelector(loadingIndicatorSelector);
    expect(loadingElementDuringLoad).toBeTruthy();

    // Verificar el párrafo dentro del contenedor de carga
    const loadingParagraphDuringLoad = loadingElementDuringLoad ? loadingElementDuringLoad.querySelector('p') : null;
    expect(loadingParagraphDuringLoad).toBeTruthy();
    expect(loadingParagraphDuringLoad!.textContent).toContain('Cargando favoritos...');

    // Espera que el contenedor de la lista este renderizado pero sin contenido
    const favoriteListContainerDuringLoad = compiled.querySelector(favoriteListContainerSelector);
    expect(favoriteListContainerDuringLoad).toBeTruthy();

    // Espera el mensaje vacío usando el selector específico
    const emptyListMessageDuringLoad = favoriteListContainerDuringLoad ? favoriteListContainerDuringLoad.querySelector(emptyListMessageSelector) : null;
    expect(emptyListMessageDuringLoad).toBeTruthy();

  });

  it('Dberia mostrar el mensaje de error si ocurre un error', () => {
    const compiled = fixture.nativeElement;
    const errorMessage = 'Error loading favorites data.';

    // Simula error desde MediaService
    isLoadingSubjectMock.next(false);
    errorMessageSubjectMock.next(errorMessage); // Emite mensaje de error
    fixture.detectChanges();

    // indicador de carga no visible
    const loadingIndicatorAfterError = compiled.querySelector(loadingIndicatorSelector);
    expect(loadingIndicatorAfterError).toBeNull();

    // Mensaje de error visible
    const errorElementAfterError = compiled.querySelector(errorDivSelector); 
    expect(errorElementAfterError).toBeTruthy();

    // Error mostrado en el párrafo dentro del contenedor
    const errorParagraphAfterError = errorElementAfterError ? errorElementAfterError.querySelector('p') : null;
    expect(errorParagraphAfterError).toBeTruthy();
    expect(errorParagraphAfterError!.textContent).toContain(errorMessage);

    // No se muestra el contenedor de la lista
    const favoriteListContainerAfterError = compiled.querySelector(favoriteListContainerSelector);
    expect(favoriteListContainerAfterError).toBeNull();

  });


  it('Deberia mostrar la lista de favoritos cuanddo el subject favoriteMedia$ emite datos', () => {
    const compiled = fixture.nativeElement;

    // Simula que el FavoriteService emite la lista de favoritos mockeada.
    favoriteMediaSubjectMock.next(mockFavoriteList);
    isLoadingSubjectMock.next(false); // Asegura que carga no está activa
    errorMessageSubjectMock.next(''); // Asegura que no hay error
    fixture.detectChanges(); // Actualiza la vista para reflejar la lista de favoritos


    // Contenedor de lista principal visible.
    const favoriteListContainer = compiled.querySelector(favoriteListContainerSelector);
    expect(favoriteListContainer).toBeTruthy();

    // Muestra el grid de las pelis/series favoritas
    const mediaGridElement = compiled.querySelector(mediaGridSelector);
    expect(mediaGridElement).toBeTruthy();

  });

  it('Deberia llamar a favoriteService.removeFavorite cuando se elimina un favorito', () => {
    favoriteMediaSubjectMock.next(mockFavoriteList);
    isLoadingSubjectMock.next(false);
    errorMessageSubjectMock.next('');
    fixture.detectChanges();

    const mediaItemDebugElement = fixture.debugElement.query(By.css('app-media-item'));
    expect(mediaItemDebugElement).toBeTruthy();

     // Creamos el Subject que controlará la lista de favoritos
    const mediaItemStubInstance = mediaItemDebugElement.componentInstance as MediaItemStubComponent;

    // Mockea el retorno de mediaService.getMediaItem y dialogService.openConfirmationDialog
    mediaServiceMock.getMediaItem.and.returnValue(of(mockFavoriteList[0]));
    dialogServiceMock.openConfirmationDialog.and.returnValue(of(true)); // Mockea retorno: Confirmado

    // Simula la emisión del output 'removedFromFavorites' desde el stub hijo.
    const itemIdToRemove = mockFavoriteList[0].id;
    mediaItemStubInstance.removedFromFavorites.emit(itemIdToRemove);

    fixture.detectChanges();

    expect(favoriteServiceMock.removeFavorite).toHaveBeenCalledTimes(1);
    expect(favoriteServiceMock.removeFavorite).toHaveBeenCalledWith(itemIdToRemove);
  });

  it('No deberia llamar a favoriteService.removeFavorite cuando se cancela la eliminación', () => {
    favoriteMediaSubjectMock.next(mockFavoriteList);
    isLoadingSubjectMock.next(false);
    errorMessageSubjectMock.next('');
    fixture.detectChanges();

    const mediaItemDebugElement = fixture.debugElement.query(
      By.css('app-media-item')
    );
    expect(mediaItemDebugElement).toBeTruthy();

    // Creamos el Subject que controlará la lista de favoritos
    const mediaItemStubInstance =
      mediaItemDebugElement.componentInstance as MediaItemStubComponent;

    // Mockea el retorno de mediaService.getMediaItem y dialogService.openConfirmationDialog
    mediaServiceMock.getMediaItem.and.returnValue(of(mockFavoriteList[0]));
    dialogServiceMock.openConfirmationDialog.and.returnValue(of(false)); // Mockea retorno: Cancelado

    // Simula la emisión del output 'removedFromFavorites' desde el stub hijo.
    const itemIdToRemove = mockFavoriteList[0].id;
    mediaItemStubInstance.removedFromFavorites.emit(itemIdToRemove);

    fixture.detectChanges();

    expect(favoriteServiceMock.removeFavorite).not.toHaveBeenCalled();
    expect(favoriteServiceMock.removeFavorite).toHaveBeenCalledTimes(0);

  });

  it('Debe ignorar la eliminación de otro favorito si el modal de confirmación está abierto', () => {
    favoriteMediaSubjectMock.next(mockFavoriteList);
    isLoadingSubjectMock.next(false);
    errorMessageSubjectMock.next('');
    fixture.detectChanges();

    const mediaItemDebugElement = fixture.debugElement.query(By.css('app-media-item'));
    expect(mediaItemDebugElement).toBeTruthy();

    const mediaItemStubInstance = mediaItemDebugElement.componentInstance as MediaItemStubComponent;

    // Espia onRemoveFavorite con callThrough
    spyOn(component, 'onRemoveFavorite').and.callThrough();

    const itemIdToAttemptRemove = mockFavoriteList[0].id;
    mediaItemStubInstance.removedFromFavorites.emit(itemIdToAttemptRemove);

    fixture.detectChanges();

    expect(component.onRemoveFavorite).toHaveBeenCalledTimes(1);
    expect(component.onRemoveFavorite).toHaveBeenCalledWith(itemIdToAttemptRemove);

    // Espara que dialogService.openConfirmationDialog no fue llamado
    expect(dialogServiceMock.openConfirmationDialog).not.toHaveBeenCalled();
    expect(dialogServiceMock.openConfirmationDialog).toHaveBeenCalledTimes(0);

    // Espera que favoriteService.removeFavorite no fue llamado
    expect(favoriteServiceMock.removeFavorite).not.toHaveBeenCalled();
    expect(favoriteServiceMock.removeFavorite).toHaveBeenCalledTimes(0);

  });

});