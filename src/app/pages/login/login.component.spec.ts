import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component'; 
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  // Mocks para los servicios que el componente inyecta, simulan el comportamiento de esos servicios
  let mockAuthService: any;
  let mockRouter: any;

  // Se usa async aquí porque lae carga de componentes y plantillas puede ser asíncrona
  beforeEach(async () => {
    mockAuthService = {
      // jasmine.createSpy('login') crea un espía para el método login y se setea el retorno como true por defecto
      login: jasmine.createSpy('login').and.returnValue(true),
      isLoggedIn$: new BehaviorSubject(false),
    };

    mockRouter = {
      // navigate para simular navegar a otras rutas
      navigate: jasmine.createSpy('navigate'),
    };

    TestBed.configureTestingModule({
      imports: [LoginComponent, CommonModule, ReactiveFormsModule],
      // providers: Proveemos las dependencias que el componente inyecta, usando nuestros mocks
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents(); // Compila los componentes y plantillas, para ello es necesaria la asincronia
  });

  // Creación e instanciación del componente
  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('Deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('Deberia inicializar el formulario en el ngOnInit', () => {
    // fixture.detectChanges() dispara ngOnInit, donde se crea el formulario
    fixture.detectChanges();

    // Comprueba que loginForm es un FormGroup
    expect(component.loginForm instanceof FormGroup).toBe(true); // Verifica el tipo

    // Comprueba que los controles existen
    expect(component.loginForm.get('username')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  it('Prueba que los controles tienen los validadores requeridos', () => {
    fixture.detectChanges();

    // Obtenemos los controles específicos
    const usernameControl = component.loginForm.get('username');
    const passwordControl = component.loginForm.get('password');

    // En estas líneas seteamos como vacio el control, comprobamos que no es valido y esperamos que tenga un error indicando que el control es requerido
    usernameControl?.setValue('');
    expect(usernameControl?.valid).toBe(false);
    expect(usernameControl?.errors?.['required']).toBe(true);

    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBe(false);
    expect(passwordControl?.errors?.['required']).toBe(true);
  });

  // Pruebas para el método onSubmit
  describe('onSubmit', () => {
    beforeEach(() => {
      fixture.detectChanges();
      // Limpia los espías de los mocks antes de cada test
      mockAuthService.login.calls.reset();
      mockRouter.navigate.calls.reset();
    });

    it('Deberia navegar a /media si el login es exitoso', () => {
      // Se setean valores cualquiera en el formulario, igual serán enviados como validos
      const username = 'testuser';
      const password = 'testpassword';
      component.loginForm.setValue({ username: username, password: password });

      // Se pasan como validos los controles del formulario
      mockAuthService.login.and.returnValue(true);

      // simulación del envío del formulario
      component.onSubmit();

      // Se verifica que AuthService.login fue llamado y cuantas veces
      expect(mockAuthService.login).toHaveBeenCalledWith(username, password);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/media']);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);

      // Comprobación adicional de que todo salió bien
      expect(component.errorMessage).toBe('');
    });

    it('Deberia mostrar un mensaje de error si el login falla y no navega', () => {
      // Valores invalidos
      const username = 'testuser';
      const password = 'testpassword';
      component.loginForm.setValue({ username: username, password: password });

      // Se asegura que los valores sean invalidos
      mockAuthService.login.and.returnValue(false);

      component.onSubmit();

      expect(mockAuthService.login).toHaveBeenCalledWith(username, password);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);

      // Se verificar que Router.navigate no fue llamado
      expect(mockRouter.navigate).not.toHaveBeenCalled();

      // Doble comprobación del error: esperamos que se muestre un mensaje de error y que no sea vacío
      expect(component.errorMessage).toBe('Usuario o contraseña incorrectos.');
      expect(component.errorMessage.length).toBeGreaterThan(0);
    });

    it('Deberia indicar que los campos vacios son requeridos', () => {

      component.loginForm.setValue({ username: '', password: '' });

      //Comprobación de formualrio inválido
      expect(component.loginForm.valid).toBeFalsy();

      component.onSubmit();

      // Se espera que el login no se llame, que no navegue y que indique un error
      expect(mockAuthService.login).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('Por favor, ingrese usuario y contraseña.');
    });

  });

});
