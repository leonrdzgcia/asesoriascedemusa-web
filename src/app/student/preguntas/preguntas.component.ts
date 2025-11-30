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
    }
  }

  // MÉTODO COMENTADO - Funcionalidad antigua
  // buscarporidExamen() {
  //   var valor = '';
  //   var valor2 = 0;//console.log(this.newData)

  //   console.log(this.dataPregunta)
  //   console.log(this.dataPregunta)
  //   console.log(this.formularioPreguntas);
  //   if (this.dataPregunta.idPregunta == null) {
  //     console.log('idpregunta vacia ');
  //     valor = this.dataPregunta.idExamen.toString();
  //   } if (this.dataPregunta.idExamen == null) {
  //     console.log(' idexamenvacia ');//valor2 = this.dataPregunta.idPregunta;
  //   }//const =
  //   console.log(valor)
  //   //console.log(this.listaUsuarios);

  //   this.api.getPreguntasIdExamen(valor).subscribe(
  //     (data) => {
  //       this.dataPreguntas = data;
  //       console.log(data);
  //     },
  //     (error) => {
  //       console.error('Error fetching data list:', error);
  //     }
  //   );
  // }

  // MÉTODO COMENTADO - Funcionalidad antigua (ahora se usa el modal de edición)
  // clickAgregarPregunta() {
  //   console.log('-- agregarActualzar ');
  //   console.log(this.dataPregunta);
  //   console.log(this.formularioPreguntas.value);
  //   if (this.formularioPreguntas.value.idPregunta == '0') {
  //     this.agregarPregunta();
  //     this.ventana('Pregunta agregada correctamente', 'OK');

  //   } else {
  //     this.ventana('Para agregar una pregunta indique el valor 0', 'ERROR');
  //   }
  //   //this.agregarActualzar2();
  // }

  // MÉTODO COMENTADO - Funcionalidad antigua (ahora se usa el modal de edición)
  // agregarPregunta() {
  //   console.log('--- agregarActualzar2 ');
  //   console.log(this.dataPregunta);
  //   console.log(this.formularioPreguntas.value);
  //   this.api.agregarPregunta(this.formularioPreguntas.value).subscribe(
  //     (response) => {
  //       console.log('Datos aagregados exitosamente :', response);
  //       // Actualiza la tabla después de agregar nuevos datos
  //       this.llenadoListaPreguntas();
  //     },
  //     (error) => {
  //       console.error('Error adding data:', error);
  //     }
  //   );
  // }

  // MÉTODO COMENTADO - Funcionalidad antigua (ahora se usa el modal de edición)
  // clickModiicarPregunta() {
  //   console.log(this.formularioPreguntas.value);
  //   if (this.formularioPreguntas.value.idPregunta == '0') {
  //     console.log('ID ES 0');
  //     this.ventana('No se puede modificar una pregunta con id sea 0', 'ERROR');
  //   } else {
  //     this.api.getPreguntasId(Number(this.formularioPreguntas.value.idPregunta)).subscribe(
  //       (data) => {
  //         this.dataPreguntas = data;
  //         console.log(data);
  //         if (data == null) {
  //           console.log('-- NO EXISTE EL USUARIO');
  //           this.ventana('Usuario no valido', 'ERROR');
  //         } else {
  //           console.log(this.formularioPreguntas.value);
  //           if (this.formularioPreguntas.value.idExamen == '') {
  //             this.formularioPreguntas.value.idExamen = data.idExamen;
  //           }
  //           if (this.formularioPreguntas.value.pregunta == '') {
  //             this.formularioPreguntas.value.pregunta = data.pregunta;
  //           }
  //           if (this.formularioPreguntas.value.respuesta_1 == '') {
  //             this.formularioPreguntas.value.respuesta_1 = data.respuesta_1;
  //           }
  //           if (this.formularioPreguntas.value.respuesta_2 == '') {
  //             this.formularioPreguntas.value.respuesta_2 = data.respuesta_2;
  //           }
  //           if (this.formularioPreguntas.value.respuesta_3 == '') {
  //             this.formularioPreguntas.value.respuesta_3 = data.respuesta_3;
  //           }
  //           if (this.formularioPreguntas.value.correcta == '') {
  //             this.formularioPreguntas.value.correcta = data.correcta;
  //           }
  //           //this.formularioPreguntas.value. = data.fechaAlta;
  //           //this.formularioPreguntas.value.fechaAlta = data.fechaAlta;
  //           //this.formularioPreguntas.value.fechaAlta = data.fechaAlta;
  //           console.log(this.formularioPreguntas.value);
  //           this.agregarPregunta();
  //           this.ventana('Usuario actualizada exitosamente ', 'OK');
  //         }
  //       },
  //       (error) => {
  //         console.error('Error fetching data list:', error);
  //       }
  //     );
  //   }
  // }

  // MÉTODO COMENTADO - Funcionalidad antigua (ahora se usa el botón de eliminar en la tabla)
  // clickEliminarPregunta() {
  //   console.log(this.formularioPreguntas.value);
  //   if (this.formularioPreguntas.value.idPregunta == '' || this.formularioPreguntas.value.idPregunta == '0') {
  //     console.log('CAMPO VACIO NOSE PUEDE ELIMINAR ');
  //     this.ventana('Agregar EL ID DE LA PREGUNTA A ELIMINAR', 'ERROR');
  //     /*this._snackBar.open('Agregar la Matricula del usuarior', 'ERROR', {
  //       duration: 3000,        horizontalPosition: 'center',        verticalPosition: 'bottom'      })*/
  //   } else {
  //     console.log('CAMPO CON INFO ');
  //     console.log(this.formularioPreguntas.value);
  //     //this.obtenerPreguntaId();
  //     this.eliminarPregunta();
  //   }
  // }

  // MÉTODO COMENTADO - Funcionalidad antigua (ahora se usa eliminarPreguntaTabla)
  // eliminarPregunta() {
  //   this.api.eliminarPregunta(Number(this.formularioPreguntas.value.idPregunta)).subscribe(
  //     () => {
  //       console.log('Datos eliminados exitosamente');
  //       // Puedes realizar otras acciones después de la eliminación
  //       this.ventana('PRegunta eliminada correctamente', 'OK');
  //       this.llenadoListaPreguntas();
  //     },
  //     error => {
  //       console.error('Error al eliminar datos:', error);
  //       this.ventana('Error al eliminar', 'ERROR');
  //       this.llenadoListaPreguntas();
  //     }
  //   );
  // }

  // MÉTODO COMENTADO - Funcionalidad antigua
  // clickEliminarTodasPreguntas(){
  //   console.log(this.formularioPreguntas.value.idExamen);
  //   const dialogRef = this.dialog.open(DialogDeleteComponent,{
  //     data: {
  //       mess: this.formularioPreguntas.value.idExamen,
  //       mensaje: '¿Está seguro de que desea eliminar todas las preguntas del examen?'
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       console.log('Opcion aceptar');
  //     } else {
  //       console.log('Opcion cancelar');
  //     }
  //   });

  // }

  abrirModalNuevaPregunta() {
    console.log('Abrir modal para nueva pregunta');
    const dialogRef = this.dialog.open(DialogEditComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: {
        idPregunta: 0,
        idExamen: this.examenSeleccionado || 0,
        pregunta: '',
        respuesta_1: '',
        respuesta_2: '',
        respuesta_3: '',
        correcta: ''
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
        idExamen: pregunta.idExamen,
        pregunta: pregunta.pregunta,
        respuesta_1: pregunta.respuesta_1,
        respuesta_2: pregunta.respuesta_2,
        respuesta_3: pregunta.respuesta_3,
        correcta: pregunta.correcta
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
