import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'; 
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {

  constructor(private dialog: MatDialog) {}

  // Método para abrir el modal de confirmación, también se setean configruraciones como el ancho y si se puede cerrar o no y recibe un mensaje como parámetro para mostrar en el modal
  openConfirmationDialog(message: string): Observable<boolean | undefined> {
    const dialogConfig: MatDialogConfig = {
      width: '300px',
      data: { message: message },
      disableClose: true
    };

    const dialogRef = this.dialog.open(
      ConfirmationDialogComponent,
      dialogConfig
    );

    return dialogRef.afterClosed();
  }
}