import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgFor } from '@angular/common';
import { EnviarinformacionService } from 'src/app/services/enviarinformacion.service';
import { DataService } from 'src/app/services/data.service';
import { ExamenService } from 'src/app/services/examen.service';
import { Pregunta } from 'src/app/interfaces/pregunta';
import * as XLSX from 'xlsx';
import { Examenmenu } from 'src/app/interfaces/examenmenu';
import { Examenint } from 'src/app/interfaces/examenint';
import { Usuarioint } from '../../interfaces/usuarioint';

@Component({
  selector: 'app-asignaciones',
  templateUrl: './asignaciones.component.html',
  styleUrls: ['./asignaciones.component.scss']
})
export class AsignacionesComponent {
  dataAsignaciones: any[] = [];
  ExcelData: any;
  loading = false;
  fechaActual: Date | undefined;
  displayedColumns: string[] = [
    'idExamen', 'nombreExamen', 'nombre', 'matricula', 'estatus', 'nivel'];
  examenmenu: Examenmenu[] = [];

  arrayExamenes: string[] = [];
  arrayExamenesInt: Examenint[] = [];
  arrayUsuarios: string[] = [];
  arrayUsuariosInt: Usuarioint[] = [];

  dataSource = [];

  banderaAsignar: boolean = false;
  banderaUsuario: boolean = false;
  banderaExamen: boolean = false;
  //opcioness  = [];
  usuarioSeleccionado: any = null;
  examenSeleccionado: any;

  dataPregunta: Pregunta = {
    //idPregunta:0,
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

  public idExamen = new FormControl('');
  public nombreExamen = new FormControl('');
  public matricula = new FormControl('', Validators.required);
  public nombre = new FormControl('');
  public estatus = new FormControl('Pendiente');
  public nivel = new FormControl('');

  public formularioAsignacion = new FormGroup({
    idExamen: this.idExamen,
    nombreExamen: this.nombreExamen,
    matricula: this.matricula,
    nombre: this.nombre,
    estatus: this.estatus,
    nivel: this.nivel
  });

  constructor(private api: ExamenService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private dataService: DataService,
    private router: Router) {
  }

  ngOnInit(): void {
    console.log('-- ngOnInit ASIGNACIONES');
    /*if (this.dataService.matricula == 0) {
      this.ventana('Favor de ingresar al portal nuevamente', 'OK');
      this.logout();
    } else {*/
      console.log('-- MATRICULA OK - ' + this.dataService.matricula);
      console.log(this.dataService);
      console.log(this.dataService.perfil);
      //this.llenadoListaExamenes();
      this.obtenerUsuariosMatriculas();
      
      this.obtenerasignaciones();
      this.obtenerExamenes();
      this.obtenerExamenesPornivel();
    
    //}
  }

  selectExamen() {
    console.log('-- checkPrintButton');
    this.banderaExamen = true;
  }

  selectUsuario() {
    this.banderaUsuario = true;
    this.buscarAsignacion();
  }

  obtenerExamenes() {
    this.api.getExamens().subscribe(
      (data) => {
        //this.arrayExamenes = data;

        console.log(data);
        console.log(data.length);
        for (let index = 0; index < data.length; index++) {
          console.log(data[index].idMateria);
          this.arrayExamenes.push(data[index].idExamen + ' - ' + data[index].idMateria);
          this.arrayExamenesInt.push({ idExamen: data[index].idExamen, nombreExamen: data[index].nombreExamen });
        }
      },
      (error) => {
        console.error('Error fetching data list:', error);
      }
    );
  }

  obtenerExamenesPornivel() {
    this.api.getExamensNivel('Preparatoria').subscribe(
      (data) => {
        //this.arrayExamenes = data;
        console.log(data);
        console.log(data.length);
        
        for (let index = 0; index < data.length; index++) {
          console.log(data[index].idMateria);
          this.arrayExamenes.push(data[index].idExamen + ' - ' + data[index].idMateria);
          this.arrayExamenesInt.push({ idExamen: data[index].idExamen, nombreExamen: data[index].nombreExamen });
        }
      },
      (error) => {
        console.error('Error fetching data list:', error);
      }
    );
  }

  obtenerUsuariosMatriculas() {   //console.log(this.listaUsuarios);
    this.api.getUsuarios().subscribe(
      (data) => {
        console.log(data);//this.opciones = data;
        console.log(data.length);
        for (let index = 0; index < data.length; index++) {
          console.log(data[index].matricula);
          this.arrayUsuarios.push(data[index].matricula + ' - ' + data[index].nombre + ' ' + data[index].apellidopaterno);
          this.arrayUsuariosInt.push(
            {
              matricula: data[index].matricula,
              nombre: data[index].nombre + ' ' + data[index].apellidopaterno,
              nivel: data[index].nivel
            });
        }
      }, (error) => {
        console.error('Error fetching data list:', error);
      }
    );
  }

  obtenerasignaciones() {
    this.api.getAsignaciones().subscribe(
      (data) => {
        this.dataAsignaciones = data;
        console.log(data);
        this.examenmenu = data;
        console.log(this.examenmenu);
      },
      (error) => {
        console.error('Error fetching data list:', error);
      }
    );
  }

  buscarAsignacion() {
    console.log(this.usuarioSeleccionado);


    if (this.usuarioSeleccionado === null) {
      this.ventana('Seleccione un usuario para buscar sus asignaciones', 'ERROR');


    } else {
      this.api.getAsignacionesMatricula(this.usuarioSeleccionado.matricula).subscribe(
        (data) => {
          this.dataAsignaciones = data;

          console.log(data);
          this.examenmenu = data;
          //console.log(this.examenmenu);      

        },
        (error) => {
          console.error('Error fetching data list:', error);
        }
      );
    }
  }
  //final
  soloNumeros(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault(); // Evitar la entrada de caracteres no numéricos
    }
  }
  submitForm() {

  }

  asignarExamen() {
    console.log(this.usuarioSeleccionado);
    console.log(this.usuarioSeleccionado.matricula);
    console.log(this.usuarioSeleccionado.nombre);
    console.log(this.usuarioSeleccionado.nivel);
    console.log(this.examenSeleccionado.idExamen);
    console.log(this.examenSeleccionado.nombreExamen);
    if (this.banderaExamen == false || this.banderaUsuario == false) {
      console.log('false');

      this.ventana('Seleccionar un Examen y Usuario', 'ERROR');
    } else {
      console.log('true');
      //console.log(this.usuarioSeleccionado);   console.log(this.examenSeleccionado);
      //console.log(this.examenSeleccionado.idExamen);//console.log(this.examenSeleccionado.nombreExamen);
      //console.log(this.usuarioSeleccionado);console.log(this.usuarioSeleccionado.matricula);//    console.log(this.usuarioSeleccionado.nombre);
      this.formularioAsignacion.value.idExamen = this.examenSeleccionado.idExamen;
      this.formularioAsignacion.value.nombreExamen = this.examenSeleccionado.nombreExamen;
      this.formularioAsignacion.value.matricula = this.usuarioSeleccionado.matricula;
      this.formularioAsignacion.value.nombre = this.usuarioSeleccionado.nombre;
      this.formularioAsignacion.value.nivel = this.usuarioSeleccionado.nivel;
      /*this.formularioAsignacion.value.estatus  = 'pendiente';
      this.formularioAsignacion.value.nivel    = 'prepa';*/
      //console.log(this.formularioAsignacion.value);//    console.log(this.arrayExamenesInt);
      this.agregarAsignacion();
    }

  }

  ventana(msj: string, sts: string) {
    this._snackBar.open(msj, sts, {
      duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom'
    });
  }

  agregarAsignacion() {
    console.log(this.formularioAsignacion.value);
    this.api.agregarAsignacion(this.formularioAsignacion.value).subscribe(
      (response) => {
        console.log('Data added successfully:', response);
        this.ventana('EXAMEN ASIGNADO EXITOSAMENTE', 'OK');
        this.obtenerasignaciones();

        //this.llenadoListaUsuarios();
      }, (error) => {
        console.error('Error adding data:', error);
      }
    );
  }

  logout() {
    this.router.navigateByUrl('/login');
  }
}
