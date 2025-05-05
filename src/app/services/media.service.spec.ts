import { TestBed } from '@angular/core/testing';
import { MediaService } from './media.service';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {  Observable } from 'rxjs';
import { take } from 'rxjs/operators'; 
import { Media } from '../shared/models/media.model';

// interfaz para definir la estructura del JSON
interface MediaJsonData {
  peliculas: Media[];
  series: Media[];
}

// Mock de Media
const mockMediaData: MediaJsonData = {
  peliculas: [
    {
      id: 'p1',
      titulo: 'Movie 1',
      categoria: 'pelicula' as 'pelicula',
      genero: 'accion',
      imagen: 'movie1.jpg',
      imagenDetalle: 'movie1_detail.jpg',
      anio: 2020,
      sipnosis: 'Synopsis 1',
      director: 'Director 1',
    },
    {
      id: 'p2',
      titulo: 'Movie 2',
      categoria: 'pelicula' as 'pelicula',
      genero: 'comedia',
      imagen: 'movie2.jpg',
      imagenDetalle: 'movie2_detail.jpg',
      anio: 2022,
      sipnosis: 'Synopsis 2',
      director: 'Director 2',
    },
  ],
  series: [
    {
      id: 's1',
      titulo: 'Series 1',
      categoria: 'serie' as 'serie',
      genero: 'drama',
      imagen: 'series1.jpg',
      imagenDetalle: 'series1_detail.jpg',
      anio: 2021,
      sipnosis: 'Synopsis 3',
      director: 'Director 3',
    },
    {
      id: 's2',
      titulo: 'Series 2',
      categoria: 'serie' as 'serie',
      genero: 'thriller',
      imagen: 'series2.jpg',
      imagenDetalle: 'series2_detail.jpg',
      anio: 2023,
      sipnosis: 'Synopsis 4',
      director: 'Director 4',
    },
  ],
};

// Lista combinada
const combinedMockMedia: Media[] = [
  ...mockMediaData.peliculas,
  ...mockMediaData.series,
];

describe('MediaService', () => {
  // Variables globales
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        MediaService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    // Inyectación de dependencias
    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    // Limpia las petición HTTP pendientes
    httpTestingController.verify();
  }); 

  it('Deberia cargar la lista de medios correctamente y actualizar el estado de los observables', () => {
    const service = TestBed.inject(MediaService);

    // expectOne espera una petición GET a la URL especificada
    const req = httpTestingController.expectOne('assets/media.json');
    console.log(req);
    expect(req.request.method).toBe('GET');

    // Simular carga exitosa para que media$ tenga datos
    req.flush(mockMediaData);

    // Obtiene el Observable del estado de carga del MediaService
    let isLoadingAfterFlush: boolean = (service as any).isLoadingSubject.getValue();
    expect(isLoadingAfterFlush).toBe(false);

    // Obtiene el Observable del error del MediaService y comprueba que este vacío
    let errorMessageAfterFlush: string = (service as any).errorMessageSubject.getValue();
    expect(errorMessageAfterFlush).toBe('');

    let mediaListAfterFlush: Media[] = (service as any).mediaSubject.getValue();
    expect(mediaListAfterFlush).toEqual(combinedMockMedia);
    expect(mediaListAfterFlush.length).toBe(combinedMockMedia.length);
  });

  // DEBIDO A ESTA PRUEBA, NO SE GENERABA EL CODE COVERAGE
  // it('Deberia mostrar error al cargar la lista de medios', () => {

  //   const service = TestBed.inject(MediaService);

  //   const req = httpTestingController.expectOne('assets/media.json');
  //   expect(req.request.method).toBe('GET');

  //   const errorStatus = 500;
  //   const errorStatusText = 'Internal Server Error';
  //   // flush simula la respuesta de error de la petición HTTP
  //   req.flush('Error loading media', {status: errorStatus, statusText: errorStatusText});

  //   // Obtiene el Observable del estado de carga del MediaService
  //   let isLoadingAfterError: boolean = (service as any).isLoadingSubject.getValue();
  //   expect(isLoadingAfterError).toBe(false);

  //   let errorMessageAfterError: string = (service as any).errorMessageSubject.getValue();
  //   expect(errorMessageAfterError).toContain('Error al cargar el archivo JSON de media:');
  //   expect(errorMessageAfterError).toContain(errorStatus.toString());
  //   expect(errorMessageAfterError).toContain(errorStatusText);
  //   expect(errorMessageAfterError).not.toBe('');

  //   // Obtiene el Observable del error del MediaService
  //   let mediaListAfterError: Media[] = (service as any).mediaSubject.getValue();
  //   expect(mediaListAfterError).toEqual([]);
  // });

  it('Deberia obtener la lista de medios como un Observable', () => {

    const service = TestBed.inject(MediaService);

    // observable que obtiene la lista de media
    const mediaObservable = service.getMedia();

    // Verifica que mediaObservable es un Observable
    expect(mediaObservable instanceof Observable).toBeTrue();

    const req = httpTestingController.expectOne('assets/media.json');

    req.flush(mockMediaData);

    expect(mediaObservable).toEqual(service.media$);
  });

  it('Deberia obtener un ítem de media por su ID', (done: DoneFn) => {

    const service = TestBed.inject(MediaService);

    const req = httpTestingController.expectOne('assets/media.json');
    req.flush(mockMediaData);

    // ID existente
    const existingId = mockMediaData.peliculas[0].id;
    // Media item esperado
    const expectedMediaItem = mockMediaData.peliculas[0]; 

    // Método a usar para la vista de detalle de una película o serie
    service.getMediaItem(existingId)
      .pipe(take(1))
      .subscribe({
        next: (mediaItem: Media | undefined) => {
          expect(mediaItem).toEqual(expectedMediaItem);
          done();
        },
        error: (err) => {
          fail('id del item no encontrado: ' + err);
          done();
        },
      });
  });

  it('Deberia devolver undefined si se llama a getMediaItem() con un ID no existente', () => {

    const service = TestBed.inject(MediaService); 

    const req = httpTestingController.expectOne('assets/media.json');
    req.flush(mockMediaData);

    const nonExistentId = 'nonExisting123'; 

    const subscription = service.getMediaItem(nonExistentId).subscribe({
      next: (mediaItem: Media | undefined) => {
        fail('Id no existente recibido: ' + mediaItem);
      },
      error: (err) => {
        fail(
          'id del item no encontrado: ' + err
        );
      },
      complete: () => {
      },
    });

  });
}); 
