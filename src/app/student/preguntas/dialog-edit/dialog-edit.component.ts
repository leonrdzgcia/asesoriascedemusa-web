import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dialog-edit',
  templateUrl: './dialog-edit.component.html',
  styleUrls: ['./dialog-edit.component.scss']
})
export class DialogEditComponent {

  public formularioEdicion: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.formularioEdicion = new FormGroup({
      idPregunta: new FormControl({ value: data.idPregunta, disabled: true }),
      idExamen: new FormControl({ value: data.idExamen, disabled: true }, Validators.required),
      encabezado: new FormControl(data.encabezado || '', Validators.required),
      pregunta: new FormControl(data.pregunta, Validators.required),
      preguntaImagen: new FormControl({ value: data.preguntaImagen || 'NA', disabled: true }),
      respuesta_1: new FormControl(data.respuesta_1, Validators.required),
      respuesta_2: new FormControl(data.respuesta_2, Validators.required),
      respuesta_3: new FormControl(data.respuesta_3, Validators.required),
      correcta: new FormControl(data.correcta, Validators.required),
      tipoRespuestas: new FormControl({ value: data.tipoRespuestas || '1', disabled: true }, Validators.required)
    });
  }

  onCancelClick(): void {
    this.dialogRef.close(null);
  }

  onSaveClick(): void {
    if (this.formularioEdicion.valid) {
      const datosActualizados = {
        ...this.formularioEdicion.value,
        idPregunta: this.data.idPregunta,
        idExamen: this.formularioEdicion.get('idExamen')?.value,
        preguntaImagen: this.formularioEdicion.get('preguntaImagen')?.value,
        tipoRespuestas: this.formularioEdicion.get('tipoRespuestas')?.value
      };
      this.dialogRef.close(datosActualizados);
    }
  }

  soloNumeros(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}
