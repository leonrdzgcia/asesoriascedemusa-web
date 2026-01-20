import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Usuario } from 'src/app/interfaces/usuario';
import { MenuService } from 'src/app/services/menu.service';
import { ExamenService } from 'src/app/services/examen.service';
import { Pregunta } from 'src/app/interfaces/pregunta';
import { DataService } from 'src/app/services/data.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DialogDeleteComponent } from './dialog-delete/dialog-delete.component';
import { DialogEditComponent } from './dialog-edit/dialog-edit.component';



@Component({
  selector: 'app-preguntas',
  templateUrl: './preguntas.component.html',
  styleUrls: ['./preguntas.component.scss']
})
export class PreguntasComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  //displayedColumns: string[] = ['idPregunta', 'idExamen', 'pregunta', 'respuesta_1', 'respuesta_2', 'respuesta_3', 'correcta'];
  displayedColumns: string[] = ['idPregunta', 'idExamen', 'pregunta', 'respuesta_1', 'respuesta_2', 'respuesta_3', 'correcta', 'acciones'];
  //dataPreguntas: any[] = [];
  dataPreguntas = new MatTableDataSource<any>();
  todasLasPreguntas: any[] = [];
  listaExamenes: any[] = [];
  examenSeleccionado: number | null = null;
  loadingFiltro: boolean = false;

  dataPregunta: Pregunta = {
    //idPregunta: 0,
    idExamen: 0,
    id: 0,
    encabezado: '',
    pregunta: '',
    preguntaImagen: '',
    respuesta_1: '',
    respuesta_2: '',
    respuesta_3: '',
    correcta: '',
    tipoRespuestas: ''
  };

  constructor(
    private api: ExamenService,
    private dataService: DataService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar) {
  }
  public idPregunta = new FormControl('', Validators.required);
  public idExamen = new FormControl('', Validators.required);
  public pregunta = new FormControl('', Validators.required);
  public respuesta_1 = new FormControl('', Validators.required);
  public respuesta_2 = new FormControl('', Validators.required);
  public respuesta_3 = new FormControl('', Validators.required);
  public correcta = new FormControl('', Validators.required);

  public formularioPreguntas = new FormGroup({
    idPregunta: this.idPregunta,
    idExamen: this.idExamen,
    pregunta: this.pregunta,
    respuesta_1: this.respuesta_1,
    respuesta_2: this.respuesta_2,
    respuesta_3: this.respuesta_3,
    correcta: this.correcta
  });

  ngOnInit(): void {
    console.log('--ngOnInit UsuariosComponent ');
    console.log(this.dataService.nombre);
    console.log(this.dataService.perfil);
    this.llenadoListaPreguntas();//this.obtenerPreguntaId();
    this.cargarExamenes();
  }

  ngAfterViewInit() {
    this.dataPreguntas.paginator = this.paginator;
    if (this.paginator) {
      this.paginator.pageSize = 100;
    }
  }

  obtenerPreguntaId() {
    //console.log(this.listaUsuarios);
    console.log(this.formularioPreguntas.value);
    this.api.getPreguntasId(Number(this.formularioPreguntas.value.idPregunta)).subscribe(
      (data) => {
        this.dataPreguntas = data;


        console.log(data);
      },
      (error) => {
        console.error('Error fetching data list:', error);
      }
    );
  }

  llenadoListaPreguntas() {
    //console.log(this.listaUsuarios);
    this.api.getPreguntas().subscribe(
      (data) => {
        this.todasLasPreguntas = data;
        this.dataPreguntas.data = data;
        console.log('Preguntas');
        console.log(data);
      },
      (error) => {
        console.error('Error fetching data list:', error);
      }
    );
    //this.dataSource2 = new MatTableDataSource(this.dataSource);
  }

  cargarExamenes() {
    this.api.getExamens().subscribe(
      (data) => {
        this.listaExamenes = data;
        console.log('Exámenes cargados:', data);
      },
      (error) => {
        console.error('Error al cargar exámenes:', error);
      }
    );
  }

  filtrarPorExamen() {
    // Mostrar spinner
    this.loadingFiltro = true;

    // Simular delay para mostrar el spinner (opcional, pero mejora UX en filtrados rápidos)
    setTimeout(() => {
      if (this.examenSeleccionado === null) {
        // Mostrar todas las preguntas
        this.dataPreguntas.data = this.todasLasPreguntas;
        console.log('Mostrando todas las preguntas');
      } else {
        // Filtrar por examen seleccionado
        const preguntasFiltradas = this.todasLasPreguntas.filter(
          pregunta => pregunta.idExamen === this.examenSeleccionado
        );
        this.dataPreguntas.data = preguntasFiltradas;
        console.log('Filtrando por examen ID:', this.examenSeleccionado);
        console.log('Preguntas filtradas:', preguntasFiltradas.length);
        console.log(this.dataPreguntas.data);
      }

      // Ocultar spinner después del filtrado
      this.loadingFiltro = false;
    }, 300);
  }





  abrirModalNuevaPregunta() {
    console.log('Abrir modal para nueva pregunta');
    const dialogRef = this.dialog.open(DialogEditComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: {
        idPregunta: 0,
        id: 0,
        idExamen: this.examenSeleccionado || 0,
        encabezado: '',
        pregunta: '',
        preguntaImagen: 'NA',
        respuesta_1: '',
        respuesta_2: '',
        respuesta_3: '',
        correcta: '',
        tipoRespuestas: '1'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Nueva pregunta a agregar:', result);
        this.agregarNuevaPregunta(result);
      } else {
        console.log('Creación cancelada');
      }
    });
  }

  abrirModalEdicion(pregunta: any) {
    console.log('Abrir modal de edición para:', pregunta);
    const dialogRef = this.dialog.open(DialogEditComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: {
        idPregunta: pregunta.idPregunta,
        id: pregunta.id,
        idExamen: pregunta.idExamen,
        encabezado: pregunta.encabezado || '',
        pregunta: pregunta.pregunta,
        preguntaImagen: pregunta.preguntaImagen || 'NA',
        respuesta_1: pregunta.respuesta_1,
        respuesta_2: pregunta.respuesta_2,
        respuesta_3: pregunta.respuesta_3,
        correcta: pregunta.correcta,
        tipoRespuestas: pregunta.tipoRespuestas || '1'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Datos actualizados:', result);
        this.actualizarPregunta(result);
      } else {
        console.log('Edición cancelada');
      }
    });
  }

  agregarNuevaPregunta(datosPregunta: any) {
    this.api.agregarPregunta(datosPregunta).subscribe(
      (response) => {
        console.log('Pregunta agregada exitosamente:', response);
        this.ventana('Pregunta agregada correctamente', 'OK');
        this.llenadoListaPreguntas();
      },
      (error) => {
        console.error('Error al agregar pregunta:', error);
        this.ventana('Error al agregar la pregunta', 'ERROR');
      }
    );
  }

  actualizarPregunta(datosPregunta: any) {
    this.api.agregarPregunta(datosPregunta).subscribe(
      (response) => {
        console.log('Pregunta actualizada exitosamente:', response);
        this.ventana('Pregunta actualizada correctamente', 'OK');
        this.llenadoListaPreguntas();
      },
      (error) => {
        console.error('Error al actualizar pregunta:', error);
        this.ventana('Error al actualizar la pregunta', 'ERROR');
      }
    );
  }

  confirmarEliminarPregunta(pregunta: any) {
    console.log('Confirmar eliminación de pregunta:', pregunta);
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      data: {
        mess: pregunta.idPregunta
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Confirmado - Eliminar pregunta ID:', pregunta.idPregunta);
        this.eliminarPreguntaTabla(pregunta.idPregunta);
      } else {
        console.log('Cancelado - No se eliminó la pregunta');
      }
    });
  }

  eliminarPreguntaTabla(idPregunta: number) {
    this.api.eliminarPregunta(idPregunta).subscribe(
      () => {
        console.log('Pregunta eliminada exitosamente');
        this.ventana('Pregunta eliminada correctamente', 'OK');
        this.llenadoListaPreguntas();
      },
      error => {
        console.error('Error al eliminar pregunta:', error);
        this.ventana('Error al eliminar la pregunta', 'ERROR');
      }
    );
  }
  ///final
  soloNumeros(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault(); // Evitar la entrada de caracteres no numéricos
    }
  }

  ventana(msj: string, sts: string) {
    this._snackBar.open(msj, sts, { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' });
  }

  clickActualizar() {
    this.ngOnInit();
  }

  submitForm() {
  }

}
