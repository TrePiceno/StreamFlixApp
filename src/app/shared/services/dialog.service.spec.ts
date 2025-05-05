import { TestBed } from '@angular/core/testing';
import { DialogService } from './dialog.service';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';

// Mock para MatDialogRef que simula abrir y cerrar el modal
// jasmine.createSpyObj crea un espía para el método afterClosed y se setea el retorno como un Observable que emite undefined por defecto
const matDialogRefMock = jasmine.createSpyObj<MatDialogRef<any>>( 'MatDialogRef', ['afterClosed']);
matDialogRefMock.afterClosed.and.returnValue(of(undefined));

// Mock para MatDialog que se inyectarpa en DialogService en los providers
const matDialogMock = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
// El comportamiento por defecto de open es retornar nuestra instancia mockeada de MatDialogRef.
matDialogMock.open.and.returnValue(matDialogRefMock);

describe('DialogService', () => {
  let service: DialogService;
  let dialogMock: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    // Configuración el módulo de testing
    TestBed.configureTestingModule({

      providers: [
        DialogService,
        // Se usa el mock de MatDialog en lugar del servicio real
        { provide: MatDialog, useValue: matDialogMock },
      ],
    });

    // Inyectar el servicio y el mock
    service = TestBed.inject(DialogService);
    dialogMock = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    // Resetea el spy open() antes de cada test para un conteo limpio.
    dialogMock.open.calls.reset();
  });

  // Verifica que el servicio se crea
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Deberia abrir el modal con pasando la configuración y el componente', () => {
    const testMessage = 'Are you sure you want to delete this item?'; // Mensaje para el modal

    // setear la misma configuración que se usa en el servicio
    const expectedConfig: MatDialogConfig = {
      width: '300px',
      data: { message: testMessage },
      disableClose: true,
    };

    // Método del servicio que abre el modal
    service.openConfirmationDialog(testMessage);

    // Espera que el método open del mock de MatDialog haya sido llamado una vez
    expect(dialogMock.open).toHaveBeenCalledTimes(1);

    // Espera que MatDialog.open fue llamado con los argumentos correctos:
    // 1. El componente que debe abrirse.
    // 2. El objeto de configuración.
    expect(dialogMock.open).toHaveBeenCalledWith(
      ConfirmationDialogComponent,
      expectedConfig
    );

  });

  it('Deberia retornar el observable de afterClosed', () => {
    // Simulación si el usuario confirma la eliminación
    const mockResult = true;

    // Retorna el observable de afterClosed con el valor true.
    matDialogRefMock.afterClosed.and.returnValue(of(mockResult));

    // Lllamamo al método del servicio que retorna el observable de afterClosed
    const resultObservable = service.openConfirmationDialog('Hello world');

    expect(resultObservable).toBeInstanceOf(Observable);

    // Se suscribe al observable de afterClosed para obtener el valor emitido
    let emittedValue: boolean | undefined;
    resultObservable.subscribe((value) => {
      emittedValue = value;
    });

    // Ambos valores deben ser iguales porque el observable de afterClosed emite el valor true
    expect(emittedValue).toBe(mockResult);

  });
});
