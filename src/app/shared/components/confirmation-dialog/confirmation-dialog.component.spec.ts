import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

// Mock de MatDialogRef que simula el comportamiento de cerrar el modal, crea un espía para el método close, de esa manera podemos controlar su comportamiento en las pruebas
const matDialogRefMock = jasmine.createSpyObj<MatDialogRef<ConfirmationDialogComponent>>('MatDialogRef', ['close']);

// Mensaje mock para usar en las pruebas
const MAT_DIALOG_DATA_MOCK = { message: 'Test Confirmation Message' };

describe('ConfirmationDialogComponent', () => {
  // Variables de prueba
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent>>; 

  // Se establece el entorno de prueba antes de cada test
  beforeEach(async () => {

    // Configurar el módulo de testing
    await TestBed.configureTestingModule({
      imports: [
        ConfirmationDialogComponent,
        CommonModule,
        MatDialogModule,
        MatButtonModule,
      ],
      providers: [
        // Mocks para las dependencias inyectadas en el constructor del componente
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: MAT_DIALOG_DATA_MOCK },
      ],
    }).compileComponents(); // compila el template y CSS del componente

    // Crea la instancia del componente y su fixture
    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;

    // Obtenemos la instancia de MatDialogRef
    dialogRefMock = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent>>;

    // Detección de cambios que se producen en el componente
    fixture.detectChanges();

  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // Test: verificar que el mensaje pasado vía MAT_DIALOG_DATA se muestra en el template
  it('Deberia mostrar el mensaje pasado via MAT_DIALOG_DATA', () => {
    // fixture.nativeElement es para acceder al DOM del componente
    const compiled = fixture.nativeElement;

    // Obtenemos el elemento p que renderiza el mensaje
    const messageElement: HTMLParagraphElement | null = compiled.querySelector('mat-dialog-content p');

    // Esperan que el elemento exista y tenga el texto correcto
    expect(messageElement).toBeTruthy();
    expect(messageElement!.textContent).toContain(MAT_DIALOG_DATA_MOCK.message);

  });

  it('Deberia llamar a dialogRef.close(true) cuando se hace clic en el botón "Confirmar"', () => {
    const compiled = fixture.nativeElement;

    // Obtenemos el botón que dispara la función de confirmación en el DOM por medio del selector, en este caso el botón es el ultimo o segundo botón dentro de mat-dialog-actions element
    const confirmButton: HTMLButtonElement | null = compiled.querySelector('mat-dialog-actions button:last-child');

    // Espera que el botón exista
    expect(confirmButton).toBeTruthy();

    // Debe estar sin llamado previo el método close()
    dialogRefMock.close.calls.reset();

    // Simula un clic en el botón "Confirmar"
    confirmButton!.click();

    // Espera que el método close() fue llamado una vez y con el argumento 'true'
    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);

  });

  // Test: verificar que hacer clic en el botón "Cancelar" llama a dialogRef.close(false)
  it('Deberia llamar a dialogRef.close(false) cuando se hace clic en el botón "Cancelar"', () => {

    const compiled = fixture.nativeElement;
    const cancelButton: HTMLButtonElement | null = compiled.querySelector('mat-dialog-actions button:first-child');
    expect(cancelButton).toBeTruthy();

    dialogRefMock.close.calls.reset();

    cancelButton!.click();
    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);

  });
});