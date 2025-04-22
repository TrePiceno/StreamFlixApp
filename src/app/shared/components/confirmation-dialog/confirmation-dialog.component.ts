import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button'; 

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
})
export class ConfirmationDialogComponent {

  // MatDialogRef para cerrar el modal y MAT_DIALOG_DATA para recibir datos del componente padre
  constructor( public dialogRef: MatDialogRef<ConfirmationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { message: string } ) {};

  // Método llamado al hacer clic en el botón "Confirmar"
  onConfirm(): void {
    // Cierra el diálogo y devuelve 'true' (indicando confirmación)
    this.dialogRef.close(true);
  }

  // Método llamado al hacer clic en el botón "Cancelar"
  onCancel(): void {
    // Cierra el diálogo y devuelve 'false'
    this.dialogRef.close(false);
  }
}