import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FavoriteService } from './favorite.service';
import { Observable, of } from 'rxjs';
import { Media } from '../shared/models/media.model';

describe('FavoriteService (localStorage and Core State)', () => {
  
  // Variables globales
  let localStorageGetItemSpy: jasmine.Spy;
  let localStorageSetItemSpy: jasmine.Spy;

  beforeEach(() => {

    // spyOn: Crea un espias de localStorage
    localStorageGetItemSpy = spyOn(globalThis.localStorage, 'getItem');
    localStorageSetItemSpy = spyOn(globalThis.localStorage, 'setItem');
    spyOn(globalThis.localStorage, 'removeItem');
    spyOn(globalThis.localStorage, 'clear');

    // LocalStorage vacío por defecto
    localStorageGetItemSpy.and.returnValue(null);

    // Configurar el módulo de testing
    TestBed.configureTestingModule({
      providers: [
        FavoriteService,
      ]
    });

  });

  // afterEach: Restaurar los spies de localStorage.
  afterEach(() => {
    localStorageGetItemSpy.and.callThrough();
    localStorageSetItemSpy.and.callThrough();
    (globalThis.localStorage.removeItem as jasmine.Spy).and.callThrough();
    (globalThis.localStorage.clear as jasmine.Spy).and.callThrough();
  });

  it('should be created', () => {
    const service = TestBed.inject(FavoriteService);
    expect(service).toBeTruthy();
  });

  it('Deberia llamar a getItem() en el constructor de FavoriteService', () => {

    // Seteamos getItem() para devolver null
    localStorageGetItemSpy.and.returnValue(null);

    // Inyectamos el servicio
    const service = TestBed.inject(FavoriteService);

    // Despues de la inyección, comprobamos que se haya llamado y pasamos la key
    expect(localStorageGetItemSpy).toHaveBeenCalledTimes(1);
    expect(localStorageGetItemSpy).toHaveBeenCalledWith('favoriteMediaIds');

  });

  it('Deberia emitir un array vacio si localStorage esta vacio', (done) => {

    localStorageGetItemSpy.and.returnValue(null); 

    const service = TestBed.inject(FavoriteService);

    // Nos suscribimos al observable
    service.favoriteIds$.subscribe((ids) => {
      expect(ids).toEqual([]);
      expect(localStorageGetItemSpy).toHaveBeenCalledTimes(1);
      expect(localStorageGetItemSpy).toHaveBeenCalledWith('favoriteMediaIds');
      // done() para indicar que la prueba ha terminado, esto se usa en los test asincronos
      done();
    });
  });

  it('Deberia emitir un array con los ids si localStorage tiene datos', (done) => {

    // Mockeamos unos ids
    const mockIds = ['id1', 'id2', 'id3'];
    // Configuramos getItem() para devolver el mock
    localStorageGetItemSpy.and.returnValue(JSON.stringify(mockIds));

    const service = TestBed.inject(FavoriteService); // <-- Create service here

    service.favoriteIds$.subscribe((ids) => {
      expect(ids).toEqual(mockIds);
      expect(localStorageGetItemSpy).toHaveBeenCalledTimes(1);
      expect(localStorageGetItemSpy).toHaveBeenCalledWith('favoriteMediaIds');
      done();
    });
  });

  it('isFavorite deberia emitir true si el ID esta en la lista actual', fakeAsync(() => {
    // initialsIds contiene los ids para simular un estado inicial
    const testItemId = 'id1';
    const initialIds = [testItemId, 'id2', 'id3'];

    // simular un estado inicial con un ID
    localStorageGetItemSpy.and.returnValue(JSON.stringify(initialIds));
    const service = TestBed.inject(FavoriteService);

    // Pasamos el ID a isFavorite() del servicio para que compruebe si el Id esta en los favorios y nos suscribimos al observable
    let isFavoriteValue: boolean | undefined;
    const subscription = service.isFavorite(testItemId).subscribe((isFav) => isFavoriteValue = isFav );

    // tick() es necesario para procesar la emisión inicial de favoriteIds$
    tick(); 

    // Espera que el Observable retornado emitió true
    expect(isFavoriteValue).toBeTrue();
    // Limpiar suscripción
    subscription.unsubscribe();
  }));

  it('isFavorite deberia emitir false si el ID NO esta en la lista actual', fakeAsync(() => {
    const testItemId = 'id1';
    const initialIds = ['id2', 'id3'];

    localStorageGetItemSpy.and.returnValue(JSON.stringify(initialIds));
    const service = TestBed.inject(FavoriteService);

    let isFavoriteValue: boolean | undefined;
    const subscription = service.isFavorite(testItemId).subscribe((isFav) => isFavoriteValue = isFav );

    tick();

    expect(isFavoriteValue).toBeFalse(); 

    subscription.unsubscribe();
  }));

  it('isFavorite deberia emitir un nuevo valor cuando la lista de favoritos cambia', fakeAsync(() => {
    const testItemId = 'id1';
    const initialIds: string[] = [];

    localStorageGetItemSpy.and.returnValue(JSON.stringify(initialIds));
    const service = TestBed.inject(FavoriteService);

    let emittedValues: boolean[] = [];
    const subscription = service.isFavorite(testItemId).subscribe((isFav) => emittedValues.push(isFav));

    tick();

    // Se esperaba que isFavorite() emita false
    expect(emittedValues).toEqual([false]);

    // addFavorite actualizará favoriteIdsSubject con el testItemId
    service.addFavorite(testItemId);

    tick();

    // Ahora favoriteIds$ debería contener el testItemId. isFavorite() debería emitir true.
    expect(emittedValues).toEqual([false, true]);

    subscription.unsubscribe();
  }));

  it('addFavorite() deberia añadir un ID si no existe', fakeAsync(() => {
    const newId = 'id1';
    const initialIds = ['id2', 'id3'];

    // Simula guardar los IDs en localStorage y el observable favoriteIds$ los contiene apartir de ahora
    localStorageGetItemSpy.and.returnValue(JSON.stringify(initialIds));
    const service = TestBed.inject(FavoriteService);
    localStorageSetItemSpy.calls.reset();

    let currentIds: string[] = [];
    // Nos suscribimos al observable y obtenemos el array actual en currentIds
    const subscription = service.favoriteIds$.subscribe((ids) => currentIds = ids );

    tick();

    expect(currentIds).toEqual(initialIds);

    // Añadimos el nuevo id a favoritos
    service.addFavorite(newId);

    // tick() es necesario para procesar la emisión desde favoriteIdsSubject.next()
    tick();

    // Espera que la lista favoriteIds$ ahora incluye el nuevo ID
    expect(currentIds).toEqual([...initialIds, newId]);
    // Espera  que localStorage.setItem fue llamado para guardar la nueva lista
    expect(localStorageSetItemSpy).toHaveBeenCalledTimes(1);
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('favoriteMediaIds',JSON.stringify([...initialIds, newId])
    );

    subscription.unsubscribe();
  }));

  it('addFavorite no deberia añadir un ID si ya existe', fakeAsync(() => {
    const existingId = 'id1';
    const initialIds = ['id1', 'id2'];

    localStorageGetItemSpy.and.returnValue(JSON.stringify(initialIds));
    const service = TestBed.inject(FavoriteService);
    localStorageSetItemSpy.calls.reset();

    let currentIds: string[] = [];
    const subscription = service.favoriteIds$.subscribe((ids) =>  currentIds = ids);

    tick();
    expect(currentIds).toEqual(initialIds);

    service.addFavorite(existingId);

    // Espera que favoriteIds$ no ha cambiado
    expect(currentIds).toEqual(initialIds);
    // Espera que localStorage.setItem NO fue llamado
    expect(localStorageSetItemSpy).not.toHaveBeenCalled();

    subscription.unsubscribe();
  }));

  it('removeFavorite debe eliminar un ID si existe', fakeAsync(() => {
    const idToRemove = 'id1';
    const initialIds = ['id1', 'id2', 'id3'];

    localStorageGetItemSpy.and.returnValue(JSON.stringify(initialIds));
    const service = TestBed.inject(FavoriteService);
    localStorageSetItemSpy.calls.reset();

    let currentIds: string[] = [];
    const subscription = service.favoriteIds$.subscribe((ids) => currentIds = ids );

    tick();
    expect(currentIds).toEqual(initialIds);

    service.removeFavorite(idToRemove);

    tick();

    // Espera que la lista favoriteIds$ ahora NO incluye el ID eliminado
    const expectedIds = initialIds.filter((id) => id !== idToRemove);
    expect(currentIds).toEqual(expectedIds);

    expect(localStorageSetItemSpy).toHaveBeenCalledTimes(1);
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('favoriteMediaIds', JSON.stringify(expectedIds));

    subscription.unsubscribe();
  }));

  // Test: removeFavorite() 
  it('removeFavorite no debe hacer nada si el ID no existe', fakeAsync(() => {
    const nonExistingId = 'id1';
    const initialIds = ['id2', 'id3'];

    localStorageGetItemSpy.and.returnValue(JSON.stringify(initialIds));
    const service = TestBed.inject(FavoriteService);
    localStorageSetItemSpy.calls.reset();

    let currentIds: string[] = [];
    // Suscribirse para verificar cuántas veces emite favoriteIds$
    const subscription = service.favoriteIds$.subscribe((ids) => currentIds = ids );

    tick();
    expect(currentIds).toEqual(initialIds);

    service.removeFavorite(nonExistingId);

    expect(currentIds).toEqual(initialIds);
    expect(localStorageSetItemSpy).not.toHaveBeenCalled();

    subscription.unsubscribe();
  }));


  it('toggleFavorite deberia llamar a addFavorite solo si el ID no está en la lista', fakeAsync(() => {
    const testItemId = 'id1';
    const initialIds = ['id2', 'id3']; 

    localStorageGetItemSpy.and.returnValue(JSON.stringify(initialIds));
    const service = TestBed.inject(FavoriteService);

    // Espiar en los métodos addFavorite y removeFavorite del servicio
    const addFavoriteSpy = spyOn(service, 'addFavorite').and.callThrough();
    const removeFavoriteSpy = spyOn(service,'removeFavorite').and.callThrough();

    // Llamar a toggleFavorite
    service.toggleFavorite(testItemId);
    
    // Verificar que removeFavorite NO fue llamado
    expect(removeFavoriteSpy).not.toHaveBeenCalled();
    // Verificar que addFavorite fue llamado con el ID correcto
    expect(addFavoriteSpy).toHaveBeenCalledTimes(1);
    expect(addFavoriteSpy).toHaveBeenCalledWith(testItemId);

  }));

  it('toggleFavorite deberia llamar a removeFavorite si el ID está en la lista', fakeAsync(() => {
    const testItemId = 'id1';
    const initialIds = ['id0', testItemId, 'id2'];

    localStorageGetItemSpy.and.returnValue(JSON.stringify(initialIds));
    const service = TestBed.inject(FavoriteService);

    const addFavoriteSpy = spyOn(service, 'addFavorite').and.callThrough();
    const removeFavoriteSpy = spyOn(service,'removeFavorite').and.callThrough();

    service.toggleFavorite(testItemId);

    // Verificar que addFavorite NO fue llamado
    expect(addFavoriteSpy).not.toHaveBeenCalled();

    expect(removeFavoriteSpy).toHaveBeenCalledTimes(1);
    expect(removeFavoriteSpy).toHaveBeenCalledWith(testItemId);
  }));

  // Test: getFavoriteMedia() 
  it('getFavoriteMedia deberia filtrar la lista de medios basándose en favoriteIds$', fakeAsync(() => {
    // Mock de la lista de medios
    const allMediaMock: Media[] = [
      {
        id: '1',
        titulo: 'Movie A',
        categoria: 'pelicula',
        genero: 'accion',
        imagen: '',
        imagenDetalle: '',
        anio: 2020,
        sipnosis: '',
        director: '',
      },
      {
        id: '2',
        titulo: 'Movie B',
        categoria: 'pelicula',
        genero: 'drama',
        imagen: '',
        imagenDetalle: '',
        anio: 2021,
        sipnosis: '',
        director: '',
      },
      {
        id: '3',
        titulo: 'Series C',
        categoria: 'serie',
        genero: 'comedia',
        imagen: '',
        imagenDetalle: '',
        anio: 2022,
        sipnosis: '',
        director: '',
      },
      {
        id: '4',
        titulo: 'Movie D',
        categoria: 'pelicula',
        genero: 'accion',
        imagen: '',
        imagenDetalle: '',
        anio: 2023,
        sipnosis: '',
        director: '',
      },
    ];
    // IDs que simulan estar en favoritos
    const favoriteIdsMock = ['2', '4'];
    const expectedFavoriteMedia: Media[] = [allMediaMock[1], allMediaMock[3]];

    // Enviar ids a localStorage para simular los favoritos iniciales
    localStorageGetItemSpy.and.returnValue(JSON.stringify(favoriteIdsMock));
    const service = TestBed.inject(FavoriteService);

    // Observable para la lista completa de medios, 'of()' para una emisión síncrona
    const allMediaObservableMock: Observable<Media[]> = of(allMediaMock);

    let filteredMedia: Media[] | undefined;
    const subscription = service.getFavoriteMedia(allMediaObservableMock).subscribe((media) => filteredMedia = media);

    // tick() procesa la emisión de allMediaObservableMock (of())
    tick();

    // Espera que el Observable retornado emitió la lista filtrada
    expect(filteredMedia).toEqual(expectedFavoriteMedia);

    subscription.unsubscribe();
  }));

});