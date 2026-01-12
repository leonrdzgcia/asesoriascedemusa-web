import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ExamenService } from 'src/app/services/examen.service';

@Component({
  selector: 'app-catalogovideos',
  templateUrl: './catalogovideos.component.html',
  styleUrls: ['./catalogovideos.component.scss']
})
export class CatalogovideosComponent implements OnInit {

  @ViewChild('paginatorCatalogos') paginatorCatalogos!: MatPaginator;

  displayedColumns: string[] = ['id', 'clase', 'acciones'];
  displayedColumnsVideos: string[] = ['id', 'nombre','acciones'];
  dataSourceCatalogos = new MatTableDataSource<any>();
  videosData: any[] = [];
  videosDisplayed: any[] = [];
  loading: boolean = false;
  loadingVideos: boolean = false;
  loadingMoreVideos: boolean = false;
  modoEdicion: boolean = false;
  catalogoSeleccionado: any = null;

  // Variables para scroll infinito
  private pageSize: number = 20;
  private currentPage: number = 0;

  // Variables para selector de categoría
  categoriaSeleccionadaId: number | null = null;
  categorias: any[] = [];

  // Variables para carga de videos
  uploadingVideo: boolean = false;
  selectedVideos: File[] = [];
  categoriaParaSubida: number | null = null;

  // Formulario
  public idCatalogo = new FormControl('');
  public clase = new FormControl('', Validators.required);

  public formularioCatalogo = new FormGroup({
    id: this.idCatalogo,
    clase: this.clase
  });

  constructor(
    private examenService: ExamenService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarVideos();
  }

  ngAfterViewInit() {
    this.dataSourceCatalogos.paginator = this.paginatorCatalogos;
  }

  cargarCatalogos(): void {
    this.loading = true;
    this.examenService.getCatalogos().subscribe({
      next: (data) => {
        this.dataSourceCatalogos.data = data;
        this.categorias = data; // También guardar para el selector
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar catálogos:', error);
        this.mostrarMensaje('Error al cargar catálogos');
        this.loading = false;
      }
    });
  }

  cargarVideos(): void {
    console.log(' // cargar videos catlogo');
    this.loadingVideos = true;
    this.examenService.getArchivos(1).subscribe({
      next: (data) => {
        this.videosData = data;
        this.currentPage = 0;
        this.loadMoreVideos();
        console.log('Videos cargados:', this.videosData);
        this.loadingVideos = false;
      },
      error: (error) => {
        console.error('Error al cargar videos:', error);
        this.mostrarMensaje('Error al cargar videos');
        this.loadingVideos = false;
      }
    });
  }

  loadMoreVideos(): void {
    if (this.loadingMoreVideos) return;

    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const newVideos = this.videosData.slice(startIndex, endIndex);

    if (newVideos.length > 0) {
      this.videosDisplayed = [...this.videosDisplayed, ...newVideos];
      this.currentPage++;
    }
  }

  onScroll(event: any): void {
    const element = event.target;
    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;

    if (atBottom && !this.loadingMoreVideos && this.videosDisplayed.length < this.videosData.length) {
      this.loadingMoreVideos = true;
      setTimeout(() => {
        this.loadMoreVideos();
        this.loadingMoreVideos = false;
      }, 300);
    }
  }

  cargarVideosPorCategoria(): void {
    if (!this.categoriaSeleccionadaId) {
      this.mostrarMensaje('Por favor seleccione una categoría');
      return;
    }

    console.log('Cargar videos para categoría:', this.categoriaSeleccionadaId);
    this.loadingVideos = true;
    this.videosDisplayed = [];

    this.examenService.getArchivos(this.categoriaSeleccionadaId).subscribe({
      next: (data) => {
        this.videosData = data;
        this.currentPage = 0;
        this.loadMoreVideos();
        console.log('Videos cargados para categoría:', this.videosData);
        this.loadingVideos = false;
      },
      error: (error) => {
        console.error('Error al cargar videos:', error);
        this.mostrarMensaje('Error al cargar videos');
        this.loadingVideos = false;
      }
    });
  }

  guardarCatalogo(): void {
    if (this.formularioCatalogo.valid) {
      const catalogoData = {
        clase: this.formularioCatalogo.value.clase
      };

      if (this.modoEdicion && this.catalogoSeleccionado) {
        // Actualizar
        this.examenService.actualizarCatalogo(this.catalogoSeleccionado.id, catalogoData).subscribe({
          next: () => {
            this.mostrarMensaje('Catálogo actualizado correctamente');
            this.cargarCatalogos();
            this.limpiarFormulario();
          },
          error: (error) => {
            console.error('Error al actualizar:', error);
            this.mostrarMensaje('Error al actualizar catálogo');
          }
        });
      } else {
        // Crear nuevo
        this.examenService.agregarCatalogo(catalogoData).subscribe({
          next: () => {
            this.mostrarMensaje('Catálogo creado correctamente');
            this.cargarCatalogos();
            this.limpiarFormulario();
          },
          error: (error) => {
            console.error('Error al crear:', error);
            this.mostrarMensaje('Error al crear catálogo');
          }
        });
      }
    } else {
      this.mostrarMensaje('Por favor complete todos los campos requeridos');
    }
  }

  editarCatalogo(catalogo: any): void {
    this.modoEdicion = true;
    this.catalogoSeleccionado = catalogo;
    this.formularioCatalogo.patchValue({
      id: catalogo.id,
      clase: catalogo.clase
    });
  }

  eliminarCatalogo(catalogo: any): void {
    if (confirm(`¿Está seguro de eliminar la categoría "${catalogo.clase}"?`)) {
      this.examenService.eliminarCatalogo(catalogo.id).subscribe({
        next: () => {
          this.mostrarMensaje('Catálogo eliminado correctamente');
          this.cargarCatalogos();
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          this.mostrarMensaje('Error al eliminar catálogo');
        }
      });
    }
  }

  limpiarFormulario(): void {
    this.formularioCatalogo.reset();
    this.modoEdicion = false;
    this.catalogoSeleccionado = null;
  }

  cancelarEdicion(): void {
    this.limpiarFormulario();
  }

  mostrarMensaje(mensaje: string): void {
    this._snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  // ============ MÉTODOS PARA CARGA DE VIDEOS ============

  onVideoSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.selectedVideos = [];
      const maxSize = 100 * 1024 * 1024; // 100MB

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validar que sea un video
        if (!file.type.startsWith('video/')) {
          this.mostrarMensaje(`${file.name} no es un video válido`);
          continue;
        }

        // Validar tamaño (máximo 100MB)
        if (file.size > maxSize) {
          this.mostrarMensaje(`${file.name} es demasiado grande. Máximo 100MB`);
          continue;
        }

        this.selectedVideos.push(file);
      }

      if (this.selectedVideos.length > 0) {
        console.log('Videos seleccionados:', this.selectedVideos.length);
      }
    }
  }

  cargarVideo(): void {
    if (this.selectedVideos.length === 0) {
      this.mostrarMensaje('Por favor seleccione al menos un video');
      return;
    }
    if (!this.categoriaParaSubida) {
      this.mostrarMensaje('Por favor seleccione una categoría para el video');
      return;
    }
    this.uploadingVideo = true;
    let uploadedCount = 0;
    let errorCount = 0;
    const totalFiles = this.selectedVideos.length;

    // Buscar el nombre de la categoría seleccionada
    const categoriaSeleccionada = this.categorias.find(cat => cat.id === this.categoriaParaSubida);
    const nombreCategoria = categoriaSeleccionada ? categoriaSeleccionada.clase : '';

    console.log(' --- Categoría seleccionada:');
    console.log( this.categoriaParaSubida);
    console.log( nombreCategoria);

    this.selectedVideos.forEach((file, index) => {
      // Primero subir el archivo al servidor FTP
      this.examenService.cargarArchivos(file, '2').subscribe({
        next: (response) => {
          console.log(`Video ${index + 1}/${totalFiles} subido al FTP:`, response);

          // Después de subir el archivo, insertar el registro en la tabla videos
          const videoData = {
            nombreArchivo: file.name,
            clase: nombreCategoria
          };

          this.examenService.agregarVideo(videoData).subscribe({
            next: (dbResponse) => {
              uploadedCount++;
              console.log(`Registro insertado en BD para: ${file.name}`, dbResponse);

              // Verificar si es el último archivo
              if (uploadedCount + errorCount === totalFiles) {
                this.finalizarCargaVideo(uploadedCount, errorCount);
              }
            },
            error: (dbError) => {
              errorCount++;
              console.error(`Error al insertar registro en BD para ${file.name}:`, dbError);

              // Verificar si es el último archivo
              if (uploadedCount + errorCount === totalFiles) {
                this.finalizarCargaVideo(uploadedCount, errorCount);
              }
            }
          });
        },
        error: (error) => {
          errorCount++;
          console.error(`Error al cargar video ${file.name}:`, error);

          // Verificar si es el último archivo
          if (uploadedCount + errorCount === totalFiles) {
            this.finalizarCargaVideo(uploadedCount, errorCount);
          }
        }
      });
    });
  }

  finalizarCargaVideo(uploadedCount: number, errorCount: number): void {
    this.uploadingVideo = false;
    this.selectedVideos = [];

    if (errorCount === 0) {
      this.mostrarMensaje(`${uploadedCount} video(s) cargado(s) exitosamente`);
    } else if (uploadedCount === 0) {
      this.mostrarMensaje('Error al cargar los videos');
    } else {
      this.mostrarMensaje(`${uploadedCount} cargado(s), ${errorCount} con error(es)`);
    }

    // Recargar videos si estamos viendo la categoría donde subimos
    if (this.categoriaSeleccionadaId === this.categoriaParaSubida) {
      this.cargarVideosPorCategoria();
    } else {
      this.cargarVideos();
    }
  }
}
