import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaListComponent } from './media-list.component';
import { MediaService } from '../../services/media.service';
import { CommonModule, AsyncPipe } from '@angular/common'; 
import { BehaviorSubject } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Media } from '../../shared/models/media.model';
import { By } from '@angular/platform-browser';

// Stub de MediaFilterComponent
@Component({ selector: 'app-media-filter', template: '', standalone: true })
class MediaFilterStubComponent {
  // El componente padre escucha el output 'filterCriteria'
  @Output() filterCriteria = new EventEmitter<any>();
}

// Stub de MediaItemComponent
@Component({ selector: 'app-media-item', template: '', standalone: true })
class MediaItemStubComponent {
  // El componente padre asigna el input 'item'
  @Input() item!: any;
}

describe('MediaListComponent (Basic Scenarios)', () => {
  let component: MediaListComponent;
  let fixture: ComponentFixture<MediaListComponent>;

  // Vriable para el mock del MediaService
  let mediaServiceMock: jasmine.SpyObj<MediaService>;

  // BehaviorSubjects mockeados para controlar el estado del servicio
  let isLoadingSubjectMock: BehaviorSubject<boolean>;
  let errorMessageSubjectMock: BehaviorSubject<string>;
  let mediaSubjectMock: BehaviorSubject<Media[]>;

  // Mock de Media
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
    {
      id: 's2',
      titulo: 'Mock Series 2',
      categoria: 'serie',
      genero: 'accion',
      imagen: '',
      imagenDetalle: '',
      anio: 2023,
      sipnosis: '',
      director: '',
    },
  ];

  // captura de selectores para los diferentes elementos condicionales
  const loadingIndicatorSelector = '.test-loading-indicator';
  const loadingParagraphSelector = loadingIndicatorSelector + ' > p';
  const errorDivSelector = '.error-message'; 
  const mediaListContainerSelector = '.media-list-container';
  const noItemsMessageSelector = '.media-list-container > div > p';

  beforeEach(async () => {

    // Configurar los BehaviorSubjects mockeados
    isLoadingSubjectMock = new BehaviorSubject<boolean>(false);
    errorMessageSubjectMock = new BehaviorSubject<string>('');
    mediaSubjectMock = new BehaviorSubject<Media[]>([]);

    // Configurar el mock del MediaService
    mediaServiceMock = jasmine.createSpyObj('MediaService', ['getMedia']);

    // Configurar las propiedades Observables de MediaService
    Object.defineProperty(mediaServiceMock, 'isLoading$', {
      value: isLoadingSubjectMock.asObservable(),
    });
    Object.defineProperty(mediaServiceMock, 'errorMessage$', {
      value: errorMessageSubjectMock.asObservable(),
    });
    // Configurar el metodo getMedia
    mediaServiceMock.getMedia.and.returnValue(mediaSubjectMock.asObservable());

    await TestBed.configureTestingModule({
      imports: [MediaListComponent, CommonModule, AsyncPipe],
      providers: [{ provide: MediaService, useValue: mediaServiceMock }],
    })
      // overrideComponent: Reemplaza el componente real con los stub
      .overrideComponent(MediaListComponent, {
        set: {
          imports: [
            CommonModule, 
            AsyncPipe,
            MediaFilterStubComponent,
            MediaItemStubComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(MediaListComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

  });

  afterEach(() => {
    if (fixture && fixture.destroy) {
      fixture.destroy(); // Limpia recursos del componente y suscripciones
    }
    // Completa los BehaviorSubjects mockeados al final de cada test
    isLoadingSubjectMock.complete();
    errorMessageSubjectMock.complete();
    mediaSubjectMock.complete();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('Deberia mostrar el componente sin elementos de carga ni error', () => {
    // fixture.nativeElement: Elemento DOM del componente
    const compiled = fixture.nativeElement;

    const initialLoadingElement = compiled.querySelector(loadingParagraphSelector);
    expect(initialLoadingElement).toBeNull();

    const initialErrorElement = compiled.querySelector(errorDivSelector);
    expect(initialErrorElement).toBeNull();

    const initialMediaListContainer = compiled.querySelector(mediaListContainerSelector);
    expect(initialMediaListContainer).toBeTruthy();

    const initialNoItemsMessage = initialMediaListContainer
      ? initialMediaListContainer.querySelector('div > p')
      : null;
    expect(initialNoItemsMessage).toBeTruthy();
    expect(initialNoItemsMessage!.textContent).toContain('No se encontraron películas o series');

    const initialMediaItemElements = fixture.debugElement.queryAll(By.css('app-media-item'));
    expect(initialMediaItemElements.length).toBe(0);
  });

  it('Deberia mostrar el indicador de carga', () => {
    const compiled = fixture.nativeElement;

    // Simular inicio de carga
    isLoadingSubjectMock.next(true);
    fixture.detectChanges(); // Actualizar la vista

    // Espera que el indicador de carga es visible
    const loadingElementDuringLoad = compiled.querySelector(loadingParagraphSelector);
    expect(loadingElementDuringLoad).toBeTruthy();
    expect(loadingElementDuringLoad!.textContent).toContain('Cargando catálogo...');

  });

  it('Deberia mostrar la lista con ítems', () => {
    const compiled = fixture.nativeElement;

    // Simula carga exitosa
    isLoadingSubjectMock.next(false);
    mediaSubjectMock.next(mockMediaList);
    fixture.detectChanges(); // Actualizar la vista

    // Espera que carga y error NO son visibles
    const loadingIndicatorAfterLoad = compiled.querySelector(
      loadingParagraphSelector
    );
    expect(loadingIndicatorAfterLoad).toBeNull();
    const errorElementAfterLoad = compiled.querySelector(errorDivSelector);
    expect(errorElementAfterLoad).toBeNull();

    // Espera que el contenedor de lista es visible
    const mediaListContainerAfterLoad = compiled.querySelector(
      mediaListContainerSelector
    );
    expect(mediaListContainerAfterLoad).toBeTruthy();

    // Espera que el mensaje de no items NO sea visible
    const noItemsMessageAfterLoad = mediaListContainerAfterLoad
      ? mediaListContainerAfterLoad.querySelector('div > p')
      : null;
    expect(noItemsMessageAfterLoad).toBeNull();

    // Espera que se renderizaron los componentes app-media-item STUBS
    const mediaItemElements = fixture.debugElement.queryAll(
      By.css('app-media-item')
    );
    expect(mediaItemElements.length).toBe(mockMediaList.length);

    // Espera que cada app-media-item stub recibió el input 'item' correcto
    mediaItemElements.forEach((debugEl, index) => {
      const stubComponentInstance =
        debugEl.componentInstance as MediaItemStubComponent;
      expect(stubComponentInstance).toBeTruthy();
      expect(stubComponentInstance.item).toEqual(mockMediaList[index]);
    });
  });

  // Simula que la carga falla y verifica que se muestra el mensaje de error.
  it('Deberia mostrar sólo el mensaje de error', () => {
    const compiled = fixture.nativeElement;
    const errorMessage = 'Error simulating media load failure.';

    // Simula falla de carga
    isLoadingSubjectMock.next(false);
    errorMessageSubjectMock.next(errorMessage); // Emite mensaje de error

    fixture.detectChanges(); // Actualizar la vista

    // Verificar que carga y lista NO son visibles, error SÍ es visible.
    const loadingIndicatorAfterError = compiled.querySelector(loadingParagraphSelector);
    expect(loadingIndicatorAfterError).toBeNull();

    const errorElementAfterError = compiled.querySelector(errorDivSelector);
    expect(errorElementAfterError).toBeTruthy();
    expect(errorElementAfterError!.textContent).toContain(errorMessage);

    const mediaListContainerAfterError = compiled.querySelector(mediaListContainerSelector);
    expect(mediaListContainerAfterError).toBeNull();

    // También verifica que no hay ítems renderizados
    const mediaItemElementsAfterError = fixture.debugElement.queryAll(By.css('app-media-item'));
    expect(mediaItemElementsAfterError.length).toBe(0);

  });

  // Verifica que el componente muestra la lista filtrada cuando los criterios coinciden con algunos ítems.
  it('Deberia mostrar la lista filtrada segun los criterios', () => {
    const compiled = fixture.nativeElement;

    isLoadingSubjectMock.next(false);
    mediaSubjectMock.next(mockMediaList);
    fixture.detectChanges();

    // Obtenes el componente app-media-filter y su instancia stub
    const mediaFilterDebugElement = fixture.debugElement.query(By.css('app-media-filter'));
    expect(mediaFilterDebugElement).toBeTruthy();
    const mediaFilterStubInstance = mediaFilterDebugElement.componentInstance as MediaFilterStubComponent;
    expect(mediaFilterStubInstance).toBeTruthy();

    // Setea los criterios de filtro en el stub para ejemplo
    const filterCriteria = { categoria: 'pelicula', genero: '' };

    // Emite los nuevos criterios de filtro
    mediaFilterStubInstance.filterCriteria.emit(filterCriteria);
    fixture.detectChanges(); // Actualizar la vista

    // Aplica los filtros y renderiza los ítems correspondientes
    const expectedFilteredList = mockMediaList.filter((item) => item.categoria === filterCriteria.categoria); 

    // Consultar los ítems renderizados de nuevo
    let mediaItemElements = fixture.debugElement.queryAll(By.css('app-media-item'));
    const noItemsMessageElement = compiled.querySelector(noItemsMessageSelector); // Asegurarse de que el mensaje de no ítems NO está

    expect(mediaItemElements.length).toBe(expectedFilteredList.length);
    expect(noItemsMessageElement).toBeNull();

    // Espera que los ítems renderizados son los correctos.
    mediaItemElements.forEach((debugEl, index) => {
      const stubComponentInstance =
        debugEl.componentInstance as MediaItemStubComponent;
      expect(stubComponentInstance.item).toEqual(expectedFilteredList[index]);
    });
  });

  // Verifica que el componente muestra el mensaje de "No se encontraron..." cuando ningún ítem coincide con los criterios.
  it('should display "no items found" message when filter criteria match no items', () => {
    const compiled = fixture.nativeElement;

    isLoadingSubjectMock.next(false);
    mediaSubjectMock.next(mockMediaList);
    fixture.detectChanges();

    const mediaFilterDebugElement = fixture.debugElement.query(By.css('app-media-filter'));
    expect(mediaFilterDebugElement).toBeTruthy();
    const mediaFilterStubInstance = mediaFilterDebugElement.componentInstance as MediaFilterStubComponent;
    expect(mediaFilterStubInstance).toBeTruthy();

    // Setea los criterios de filtro en el stub para ejemplo
    const emptyFilterCriteria = {
      categoria: 'categoria-inexistente',
      genero: '',
    };

    // Emite los nuevos criterios de filtro
    mediaFilterStubInstance.filterCriteria.emit(emptyFilterCriteria);
    fixture.detectChanges(); // Actualizar la vista

    // El componente debería mostrar el mensaje de "No se encontraron..."
    let mediaItemElements = fixture.debugElement.queryAll(By.css('app-media-item'));
    const noItemsMessageElement = compiled.querySelector(noItemsMessageSelector);
    expect(mediaItemElements.length).toBe(0);
    expect(noItemsMessageElement).toBeTruthy();
    expect(noItemsMessageElement!.textContent).toContain('No se encontraron películas o series');

  });
  
});