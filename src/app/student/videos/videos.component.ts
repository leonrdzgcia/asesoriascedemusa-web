import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExamenService } from 'src/app/services/examen.service';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.scss']
})
export class VideosComponent implements OnInit {

  displayedColumns: string[] = ['id', 'nombre'];
  dataSourceVideos: any[] = [];
  dataSourceCatalogos: any[] = [];
  loading: boolean = false;
  uploadingFile: boolean = false;
  selectedFiles: File[] = [];
  catalogoSeleccionado: any = null;

  constructor(
    private examenService: ExamenService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarVideos();
    this.cargarCatalogos();
  }

  cargarVideos(): void {
    this.loading = true;
    this.examenService.getArchivos(1).subscribe({
      next: (data) => {
        this.dataSourceVideos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar videos:', error);
        this.mostrarMensaje('Error al cargar videos');
        this.loading = false;
      }
    });
  }

  cargarCatalogos(): void {
    this.examenService.getCatalogos().subscribe({
      next: (data) => {
        this.dataSourceCatalogos = data;
      },
      error: (error) => {
        console.error('Error al cargar catálogos:', error);
        this.mostrarMensaje('Error al cargar catálogos');
      }
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = [];
      const maxSize = 100 * 1024 * 1024; // 100MB

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith('video/')) {
          this.mostrarMensaje(`${file.name} no es un video válido`);
          continue;
        }

        if (file.size > maxSize) {
          this.mostrarMensaje(`${file.name} es demasiado grande. Máximo 100MB`);
          continue;
        }

        this.selectedFiles.push(file);
      }

      if (this.selectedFiles.length > 0) {
        console.log('Videos seleccionados:', this.selectedFiles.length);
      }
    }
  }

  subirVideos(): void {
    if (this.selectedFiles.length === 0) {
      this.mostrarMensaje('Por favor seleccione al menos un video');
      return;
    }
    if (!this.catalogoSeleccionado) {
      this.mostrarMensaje('Por favor seleccione un catálogo');
      return;
    }

    this.uploadingFile = true;
    let uploadedCount = 0;
    let errorCount = 0;
    const totalFiles = this.selectedFiles.length;
    const nombreCatalogo = this.catalogoSeleccionado.clase;

    this.selectedFiles.forEach((file, index) => {
      this.examenService.cargarArchivos(file, '2', file.name, nombreCatalogo).subscribe({
        next: (response) => {
          uploadedCount++;
          console.log(`Video ${index + 1}/${totalFiles} subido y registrado:`, response);

          if (uploadedCount + errorCount === totalFiles) {
            this.finalizarCarga(uploadedCount, errorCount);
          }
        },
        error: (error) => {
          errorCount++;
          console.error(`Error al cargar video ${file.name}:`, error);

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
      this.mostrarMensaje(`${uploadedCount} video(s) cargado(s) exitosamente`);
    } else if (uploadedCount === 0) {
      this.mostrarMensaje('Error al cargar los videos');
    } else {
      this.mostrarMensaje(`${uploadedCount} cargado(s), ${errorCount} con error(es)`);
    }

    this.cargarVideos();
  }

  actualizarTabla(): void {
    this.cargarVideos();
  }

  mostrarMensaje(mensaje: string): void {
    this._snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
