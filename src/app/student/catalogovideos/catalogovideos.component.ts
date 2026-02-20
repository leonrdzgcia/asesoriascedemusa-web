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

  // Variables para listas desplegables
  usuarios: any[] = [];
  usuarioSeleccionado: any = null;
  catalogoSeleccionadoDerecha: any = null;
  asignando: boolean = false;

  // Variables para carga de videos en columna derecha
  selectedVideosUpload: File[] = [];
  uploadingVideoRight: boolean = false;

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
    this.cargarUsuarios();
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

  cargarUsuarios(): void {
    this.examenService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.mostrarMensaje('Error al cargar usuarios');
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

  // ============ MÉTODOS PARA ASIGNAR VIDEOS ============

  asignarVideos(): void {
    if (!this.catalogoSeleccionadoDerecha) {
      this.mostrarMensaje('Por favor seleccione un catálogo');
      return;
    }
    if (!this.usuarioSeleccionado) {
      this.mostrarMensaje('Por favor seleccione un usuario');
      return;
    }

    this.asignando = true;
    const claseSeleccionada = this.catalogoSeleccionadoDerecha.clase;
    const matricula = this.usuarioSeleccionado.matricula;

    // Obtener todos los videos y filtrar por clase
    this.examenService.getVideos().subscribe({
      next: (videos) => {
        const videosFiltrados = videos.filter((v: any) => v.clase === claseSeleccionada);

        if (videosFiltrados.length === 0) {
          this.mostrarMensaje('No hay videos para la clase seleccionada');
          this.asignando = false;
          return;
        }

        let asignadosCount = 0;
        let errorCount = 0;
        const total = videosFiltrados.length;

        videosFiltrados.forEach((video: any) => {
          const asignacion = {
            matricula: matricula,
            nombreVideo: video.nombreArchivo,
            clase: video.clase,
            idVideo: video.id
          };

          this.examenService.guardarAsignacionVideo(asignacion).subscribe({
            next: () => {
              asignadosCount++;
              if (asignadosCount + errorCount === total) {
                this.finalizarAsignacion(asignadosCount, errorCount);
              }
            },
            error: (error) => {
              errorCount++;
              console.error('Error al asignar video:', error);
              if (asignadosCount + errorCount === total) {
                this.finalizarAsignacion(asignadosCount, errorCount);
              }
            }
          });
        });
      },
      error: (error) => {
        console.error('Error al obtener videos:', error);
        this.mostrarMensaje('Error al obtener la lista de videos');
        this.asignando = false;
      }
    });
  }

  finalizarAsignacion(asignadosCount: number, errorCount: number): void {
    this.asignando = false;
    if (errorCount === 0) {
      this.mostrarMensaje(`${asignadosCount} video(s) asignado(s) correctamente`);
    } else if (asignadosCount === 0) {
      this.mostrarMensaje('Error al asignar los videos');
    } else {
      this.mostrarMensaje(`${asignadosCount} asignado(s), ${errorCount} con error(es)`);
    }
  }

  // ============ MÉTODOS PARA SUBIR VIDEOS (COLUMNA DERECHA) ============

  onVideoSelectedRight(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.selectedVideosUpload = [];
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

        this.selectedVideosUpload.push(file);
      }
    }
  }

  subirVideosRight(): void {
    if (this.selectedVideosUpload.length === 0) {
      this.mostrarMensaje('Por favor seleccione al menos un video');
      return;
    }
    if (!this.catalogoSeleccionadoDerecha) {
      this.mostrarMensaje('Por favor seleccione un catálogo');
      return;
    }

    this.uploadingVideoRight = true;
    let uploadedCount = 0;
    let errorCount = 0;
    const totalFiles = this.selectedVideosUpload.length;
    const nombreCatalogo = this.catalogoSeleccionadoDerecha.clase;

    this.selectedVideosUpload.forEach((file) => {
      this.examenService.cargarArchivos(file, '2', file.name, nombreCatalogo).subscribe({
        next: () => {
          uploadedCount++;
          if (uploadedCount + errorCount === totalFiles) {
            this.finalizarSubidaRight(uploadedCount, errorCount);
          }
        },
        error: (error) => {
          errorCount++;
          console.error(`Error al cargar video ${file.name}:`, error);
          if (uploadedCount + errorCount === totalFiles) {
            this.finalizarSubidaRight(uploadedCount, errorCount);
          }
        }
      });
    });
  }

  finalizarSubidaRight(uploadedCount: number, errorCount: number): void {
    this.uploadingVideoRight = false;
    this.selectedVideosUpload = [];

    if (errorCount === 0) {
      this.mostrarMensaje(`${uploadedCount} video(s) subido(s) exitosamente`);
    } else if (uploadedCount === 0) {
      this.mostrarMensaje('Error al subir los videos');
    } else {
      this.mostrarMensaje(`${uploadedCount} subido(s), ${errorCount} con error(es)`);
    }
  }
}
