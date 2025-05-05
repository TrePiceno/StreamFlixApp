import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let localStorageMock: { [key: string]: string | null };
  let mockRouter: any;

  beforeEach(() => {
    localStorageMock = {};

    // Intercepta getItem
    spyOn(window.localStorage, 'getItem').and.callFake(
      (key: string) => localStorageMock[key] || null
    );

    spyOn(window.localStorage, 'setItem').and.callFake(
      (key: string, value: string) => (localStorageMock[key] = value)
    );

    spyOn(window.localStorage, 'removeItem').and.callFake(
      (key: string) => delete localStorageMock[key]
    );

    // Creamos un mock simple para el Router con un espía para 'navigate'
    mockRouter = {
      navigate: jasmine.createSpy('navigate'), // Espía para el método navigate
      events: new BehaviorSubject({}),
    };

    // Configura el módulo de testing
    TestBed.configureTestingModule({
      // providers: define las dependencias que TestBed debe proveer
      providers: [AuthService, { provide: Router, useValue: mockRouter }]
    });

    // se inyecta el servicio usando TestBed.inject
    service = TestBed.inject(AuthService);
  });

  it('Deberia instanciarse el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {

    it('Deberia verificar que el estado es inicialmente false cuando localTorage está vacio', () => {

      let isLoggedInState: boolean | null = null;
      service.isLoggedIn$
        .subscribe((state) => (isLoggedInState = state))
        .unsubscribe();
      expect(isLoggedInState).toBeFalsy();

      expect(window.localStorage.getItem).toHaveBeenCalledWith('isLoggedIn');
      expect(window.localStorage.getItem).toHaveBeenCalledTimes(1);

    });

  });

  describe('Login', () => {
    it('Deberia retornar a true al loguearse exitosamente', () => {
      const success = service.login('admin', 'pass123');
      // Se verifica que el método login retornó true
      expect(success).toBe(true);
    });

    it('Deberia cambiar el estado a true al loguearse exitosamente', () => {
      service.login('admin', 'pass123');
      let isLoggedInState: boolean | null = null;
      service.isLoggedIn$
        .subscribe((state) => (isLoggedInState = state))
        .unsubscribe();
      expect(isLoggedInState).toBeTruthy();
    });

    it('Deberia setear la sesión en localStorage si fue exitosa', () => {
      service.login('admin', 'pass123');
      expect(localStorageMock['isLoggedIn']).toBe('true');
    });

    it('Deberia retornar false si las credenciales son incorrectas', () => {
      const success = service.login('user', 'pass456');
      expect(success).toBe(false);
    });

    it('Deberia mentener el estado en false si las credenciales son incorrectas', () => {
      service.login('user', 'pass456');
      let isLoggedInState: boolean | null = null;
      service.isLoggedIn$
        .subscribe((state) => (isLoggedInState = state))
        .unsubscribe();
      expect(isLoggedInState).toBeFalsy();
    });

    it('No deberia navegar si las credenciales son incorrectas', () => {
      service.login('user', 'pass456');
      // esto verifica que el espía del mockRouter NO fue llamado
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    // Pruebas para logout
    describe('Logout', () => {
      it('Deberia cambiar el estado a false al hacer logout', () => {
        // Simulamos un login exitoso
        service.login('admin', 'pass123');
        let isLoggedInStateBeforeLogout: boolean | null = null;
        service.isLoggedIn$
          .subscribe((state) => (isLoggedInStateBeforeLogout = state))
          .unsubscribe();
        expect(isLoggedInStateBeforeLogout).toBeTruthy();

        // Simulamos un logout
        service.logout();
        let isLoggedInStateAfterLogout: boolean | null = null;
        service.isLoggedIn$
          .subscribe((state) => (isLoggedInStateAfterLogout = state))
          .unsubscribe();
        expect(isLoggedInStateAfterLogout).toBeFalsy();
      });

      it('Deberia remover la sesión de localStorage al hacer logout', () => {
        // Simulamos un login exitoso
        service.login('admin', 'pass123');
        // Seteamos la sesión en localStorage
        expect(localStorageMock['isLoggedIn']).toBe('true');

        // Simulamos un logout
        service.logout();
        // Removemos la sesión de localStorage
        expect(window.localStorage.removeItem).toHaveBeenCalledWith(
          'isLoggedIn'
        );
        expect(localStorageMock['isLoggedIn']).toBeUndefined();
      });

      it('Deberia navegar a /login al hacer logout', () => {
        service.login('admin', 'pass123');
        // Seteamos la sesión en localStorage
        expect(localStorageMock['isLoggedIn']).toBe('true');

        service.logout();

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
        expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      });
    });

    // Prueba para el getter
    it('isLoggedIn getter should return the current value of isLoggedInSubject', () => {
      // Inicialmente debería ser false (por defecto)
      expect(service.isLoggedIn).toBe(false);

      // Login
      service.login('admin', 'pass123');
      expect(service.isLoggedIn).toBe(true);

      // Logout
      service.logout();
      // El getter debería reflejar el nuevo estado
      expect(service.isLoggedIn).toBe(false);
    });
  });

});