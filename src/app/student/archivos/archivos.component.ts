import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExamenService } from 'src/app/services/examen.service';

@Component({
  selector: 'app-archivos',
  templateUrl: './archivos.component.html',
  styleUrls: ['./archivos.component.scss']
})
export class ArchivosComponent implements OnInit {

  displayedColumns: string[] = ['id', 'nombre'];
  dataSourceArchivos: any[] = [];
  tipoArchivoSeleccionado: number = 2; // Filtrar solo imágenes (tipo 2)
  loading: boolean = false;
  uploadingFile: boolean = false;
  selectedFiles: File[] = [];

  constructor(
    private examenService: ExamenService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarArchivos();
  }

  cargarArchivos(): void {
    this.loading = true;
    // Cargar solo imágenes (tipo 2)
    this.examenService.getArchivos(2).subscribe({
      next: (data) => {
        this.dataSourceArchivos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar archivos:', error);
        this.mostrarMensaje('Error al cargar imágenes');
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = [];
      const maxSize = 10 * 1024 * 1024; // 10MB

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
          this.mostrarMensaje(`${file.name} no es una imagen válida`);
          continue;
        }

        // Validar tamaño (máximo 10MB)
        if (file.size > maxSize) {
          this.mostrarMensaje(`${file.name} es demasiado grande. Máximo 10MB`);
          continue;
        }

        this.selectedFiles.push(file);
      }

      if (this.selectedFiles.length > 0) {
        console.log('Archivos seleccionados:', this.selectedFiles.length);
      }
    }
  }

  cargarImagen(): void {
    if (this.selectedFiles.length === 0) {
      this.mostrarMensaje('Por favor seleccione al menos una imagen');
      return;
    }

    this.uploadingFile = true;
    let uploadedCount = 0;
    let errorCount = 0;
    const totalFiles = this.selectedFiles.length;

    this.selectedFiles.forEach((file, index) => {
      // Llamar al método con los dos parámetros requeridos: file y src
      this.examenService.cargarArchivos(file, '1').subscribe({
        next: (response) => {
          uploadedCount++;
          console.log(`Imagen ${index + 1}/${totalFiles} cargada:`, response);

          // Verificar si es el último archivo
          if (uploadedCount + errorCount === totalFiles) {
            this.finalizarCarga(uploadedCount, errorCount);
          }
        },
        error: (error) => {
          errorCount++;
          console.error(`Error al cargar imagen ${file.name}:`, error);

          // Verificar si es el último archivo
          if (uploadedCount + errorCount === totalFiles) {
            this.finalizarCarga(uploadedCount, errorCount);
          }
        }
      });
    });
  }

  finalizarCarga(uploadedCount: number, errorCount: number): void {
    this.uploadingFile = false;
    this.selectedFiles = [];

    if (errorCount === 0) {
      this.mostrarMensaje(`${uploadedCount} imagen(es) cargada(s) exitosamente`);
    } else if (uploadedCount === 0) {
      this.mostrarMensaje('Error al cargar las imágenes');
    } else {
      this.mostrarMensaje(`${uploadedCount} cargada(s), ${errorCount} con error(es)`);
    }

    this.cargarArchivos(); // Recargar la tabla
  }

  actualizarTabla(): void {
    this.cargarArchivos();
  }

  mostrarMensaje(mensaje: string): void {
    this._snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
11
