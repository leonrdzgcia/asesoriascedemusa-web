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
import { environment } from 'src/environments/environment';
import { UploadResponse } from 'aws-s3-upload-ash/dist/types';
import AWSS3UploadAshClient from 'aws-s3-upload-ash';

@Component({
  selector: 'app-examenes',
  templateUrl: './examenes.component.html',
  styleUrls: ['./examenes.component.scss']
})
export class ExamenesComponent {

  dataSourceExamenes: any[] = [];
  ExcelData: any;
  loading = false;
  fechaActual: Date | undefined;
  nivelSeleccionado: string = '';
  displayedColumns: string[] = ['idExamen', 'tipo', 'nombreExamen', 'idMateria', 'nivel', 'tiempo', 'preguntas90', 'acciones'];
  opciones: string[] = ['Preparatoria', 'Facultad', 'Secundaria'];
  banderaNoventaPreguntas: boolean = false; //true : 7000pts / false 100%
  mostrarFormularioCrear: boolean = false;
  mostrarFormularioEditar: boolean = false;
  examenEnEdicion: any = null;
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
  srcDef = './assets/img/';

  public idExamen = new FormControl('', Validators.required);
  public tipo = new FormControl('Examen');
  public nombreExamen = new FormControl('', Validators.required);
  public idMateria = new FormControl('', Validators.required);
  public nivel = new FormControl('');
  public tiempo = new FormControl('', Validators.required);
  public preguntas90 = new FormControl('');

  //aws archivos
  fileSelected: any = null;
  config = {
    bucketName: 'bucket-img-cedemusa',
    dirName: 'media', /* optional - when use: e.g BUCKET_ROOT/dirName/fileName.extesion */
    region: 'us-east-1',
    accessKeyId: environment.AWS_ACCESS_KEY,
    secretAccessKey: environment.AWS_SECRET_KEY,
    s3Url: 'https://bucket-img-cedemusa.s3.amazonaws.com/'
  }
  S3CustomClient: AWSS3UploadAshClient = new AWSS3UploadAshClient(this.config);
  //


  constructor(
    private api: ExamenService, private fb: FormBuilder, private _snackBar: MatSnackBar, private dataService: DataService) {
  }

  public formularioExamen = new FormGroup({
    idExamen: this.idExamen,
    tipo: this.tipo,
    nombreExamen: this.nombreExamen,
    idMateria: this.idMateria,
    tiempo: this.tiempo,
    nivel: this.nivel,
    preguntas90: this.preguntas90,
  });


  ngOnInit(): void {
    console.log('-- ngOnInit EXAMENES');
    console.log(this.dataService.perfil);
    this.llenadoListaExamenes();
  }

  onChangeFile(event: any) {
    console.log(event.target.files[0])
    this.fileSelected = event.target.files[0]
  }

  async handleSendFile() {
    if (this.fileSelected == null) {
      this.ventana('No se hay archivo seleccionado para guardar', 'ERROR');
    }else{
      await this.S3CustomClient
      .uploadFile(this.fileSelected, this.fileSelected.type, undefined, this.fileSelected.name, "public-read")
      .then((data: UploadResponse) => console.log(data))
      .catch((err: any) => console.error(err))
    }
  }

  toggleFormularioCrear() {
    this.mostrarFormularioCrear = !this.mostrarFormularioCrear;
    if (this.mostrarFormularioCrear) {
      // Limpiar formulario al abrir
      this.formularioExamen.reset({
        idExamen: '0',
        tipo: 'Examen',
        nombreExamen: '',
        idMateria: '',
        tiempo: '',
        nivel: '',
        preguntas90: ''
      });
      this.nivelSeleccionado = '';
    }
  }

  clickAgregarExamen() {
    if (this.formularioExamen.value.idExamen == '0') {
      this.formularioExamen.value.nivel = this.nivelSeleccionado;
      this.agregarExamen();
    } else {
      this.ventana('Para agregar un Examen indique el valor 0', 'ERROR');
    }
  }

  agregarExamen(): void {
    console.log(this.formularioExamen.value);//this.api.agregarExamen(this.newData).subscribe(
    this.api.agregarExamen(this.formularioExamen.value).subscribe(
      (response) => {
        console.log('Datos aagregados exitosamente :', response);
        this.ventana('Examen guardado exitosamente', 'OK');
        this.llenadoListaExamenes();
      },
      (error) => {
        console.error('Error adding data:', error);
      }
    );
  }

  agregarExamenPreguntas(idExamen: string): void {
    console.log(this.formularioExamen.value);//this.api.agregarExamen(this.newData).subscribe(
    this.api.agregarExamen(idExamen).subscribe(
      (response) => {
        console.log('Datos aagregados exitosamente :', response);
        this.ventana('Examen guardado exitosamente', 'OK');
        this.llenadoListaExamenes();
      },
      (error) => {
        console.error('Error adding data:', error);
      }
    );
  }

  asignarNivel() {
    this.formularioExamen.value.nivel = this.nivelSeleccionado;
  }

  leerExcel(event: any) {
    let file = event.target.files[0];
    let fileReader = new FileReader();
    fileReader.readAsBinaryString(file);
    fileReader.onload = (e) => {
      var workBook = XLSX.read(fileReader.result, {
        type: 'binary'
      }
      );
      var sheetNames = workBook.SheetNames;
      this.ExcelData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetNames[0]]);
    }
    this.ventana('Archivo seleccionado correctamente, pendiente de guardar', '');
  }

  clickGuardarArchivo() {
    if (this.ExcelData == null) {
      console.log('-----excel null ');
      this.ventana('No hay excel cargado', 'ERROR');
    } else {
      if (this.ExcelData[0].numero != '') {
        //this.api.getExamenIdExamen(this.ExcelData[0].numero).subscribe(
        this.api.getExamenIdExamen(this.ExcelData[0].encabezado).subscribe(
          (data) => {
            console.log(data);
            if (data == null) {
              console.log('-- NO EXISTE EL EXAMEN ' + this.ExcelData[0].encabezado);
              this.ventana('No existe el examen ' + this.ExcelData[0].encabezado, 'ERROR');
            } else {
              this.fechaActual = new Date();
              console.log(this.ExcelData.length);
              for (let i = 1; i < this.ExcelData.length; i++) {
                this.dataPregunta.idExamen = this.ExcelData[0].encabezado;
                var str = this.ExcelData[i]+'';
                const caracteresArray = this.ExcelData[i].respuesta1.toString().split('');
                const caracteresInvertidos = caracteresArray.reverse();
                const cadenaInvertida = caracteresInvertidos.join('');

                if (cadenaInvertida.substring(0,4) == 'gpj.') {
                  console.log('ES RESPUESTA IMAGEN ');
                  this.dataPregunta.respuesta_1 = this.srcDef + this.ExcelData[i].respuesta1;
                  this.dataPregunta.respuesta_2 = this.srcDef + this.ExcelData[i].respuesta2;
                  this.dataPregunta.respuesta_3 = this.srcDef+this.ExcelData[i].respuesta3;
                  this.dataPregunta.tipoRespuestas = '2';//respuestas imagen
                }else{
                  console.log('ES RESPUESTA nomal ');
                  this.dataPregunta.respuesta_1 = this.ExcelData[i].respuesta1;
                  this.dataPregunta.respuesta_2 = this.ExcelData[i].respuesta2;
                  this.dataPregunta.respuesta_3 = this.ExcelData[i].respuesta3;
                  this.dataPregunta.tipoRespuestas = '1';//respuestas letras
                }
                console.log(this.ExcelData[i].pregunta);
                this.dataPregunta.id     = this.ExcelData[i].numero;
                this.dataPregunta.encabezado     = this.ExcelData[i].encabezado;
                this.dataPregunta.pregunta       = this.ExcelData[i].pregunta;
                if (this.ExcelData[i].preguntaImagen == 'NA') {
                  this.dataPregunta.preguntaImagen = this.ExcelData[i].preguntaImagen;
                }else{
                  console.log(this.ExcelData[i].numero);
                  this.dataPregunta.preguntaImagen = this.srcDef + this.ExcelData[i].preguntaImagen;
                }
                this.dataPregunta.correcta       = this.ExcelData[i].correcta;
                this.agregarPregunta();
              }
              console.log(this.dataService.examenasignado);
              this.dataService.examenasignado = this.ExcelData[0].encabezado;
              console.log(this.dataService.examenasignado);
              this.ventana('Preguntas cargadas correctamente al examen ' + this.ExcelData[0].encabezado, 'OK');
              this.guardarNumeroPreguntasExamen();

            }
          },
          (error) => {
            console.error('Error fetching data list:', error);
          }
        );
      }
    }
  }

  guardarNumeroPreguntasExamen() {
    console.log(this.ExcelData[0].encabezado);
    console.log(this.ExcelData[0].respuesta1);
    this.api.getExamenIdExamen(Number(this.ExcelData[0].encabezado)).subscribe(
      (data) => {
        console.log(data);
        if (data == null) {
          console.log('-- NO EXISTE EL examen');
          this.ventana('Examen no valido', 'ERROR');
        } else {
          this.formularioExamen.value.idExamen = data.idExamen;
          this.formularioExamen.value.nombreExamen = data.nombreExamen;
          this.formularioExamen.value.idMateria = data.idMateria;
          this.formularioExamen.value.nivel = data.nivel;
          this.formularioExamen.value.tipo = data.tipo;
          this.formularioExamen.value.tiempo = data.tiempo;
          this.formularioExamen.value.preguntas90 = this.ExcelData[0].respuesta1;
          this.agregarExamen();
        }
      },
      (error) => {
        console.error('Error fetching data list:', error);
      }
    );

  }

  editarExamenTabla(examen: any) {
    console.log('Editar examen:', examen);
    this.examenEnEdicion = { ...examen };
    this.mostrarFormularioCrear = false;
    this.mostrarFormularioEditar = true;
    this.formularioExamen.patchValue({
      idExamen: examen.idExamen,
      tipo: examen.tipo,
      nombreExamen: examen.nombreExamen,
      idMateria: examen.idMateria,
      tiempo: examen.tiempo,
      nivel: examen.nivel,
      preguntas90: examen.preguntas90
    });
    this.nivelSeleccionado = examen.nivel;
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion() {
    this.mostrarFormularioEditar = false;
    this.examenEnEdicion = null;
    this.formularioExamen.reset({
      idExamen: '',
      tipo: 'Examen',
      nombreExamen: '',
      idMateria: '',
      tiempo: '',
      nivel: '',
      preguntas90: ''
    });
    this.nivelSeleccionado = '';
  }

  guardarEdicion() {
    if (!this.formularioExamen.valid) {
      this.ventana('Por favor complete todos los campos requeridos', 'ERROR');
      return;
    }

    this.formularioExamen.value.nivel = this.nivelSeleccionado;
    console.log('Guardando edición:', this.formularioExamen.value);

    this.api.agregarExamen(this.formularioExamen.value).subscribe(
      (response) => {
        console.log('Examen actualizado exitosamente:', response);
        this.ventana('Examen actualizado correctamente', 'OK');
        this.llenadoListaExamenes();
        this.cancelarEdicion();
      },
      (error) => {
        console.error('Error al actualizar examen:', error);
        this.ventana('Error al actualizar el examen', 'ERROR');
      }
    );
  }

  eliminarExamenTabla(idExamen: number) {
    if (confirm('¿Está seguro de que desea eliminar este examen?')) {
      this.api.eliminarExamen(idExamen).subscribe(
        (da) => {
          console.log(da);
          this.ventana('Examen eliminado correctamente', 'OK');
          this.llenadoListaExamenes();
        },
        error => {
          console.error('Error al eliminar datos:', error);
          this.ventana('Error al eliminar el examen', 'ERROR');
        }
      );
    }
  }

  clickEliminarExamen() {
    console.log(this.formularioExamen);
    console.log(this.formularioExamen.value.idExamen);
    if (this.formularioExamen.value.idExamen == '' || this.formularioExamen.value.idExamen == '0') {
      console.log('CAMPO VACIO NOSE PUEDE ELIMINAR ');
      //console.error('Error al eliminar datos:');
      this.ventana('Agregar el IDEXAMEN a eliminar', 'ERROR');
    } else {
      console.log('CAMPO CON INFO ');
      //this.valoreliminar = Number(this.formularioExamen.value.idExamen);
      //this.bandera = !this.bandera; // Cambiar la condición al hacer clic, por ejemplo
      this.eliminarExamen();
    }
  }

  eliminarExamen() {
    this.api.eliminarExamen(Number(this.formularioExamen.value.idExamen)).subscribe(
      (da) => {
        console.log(da);
      },
      error => {
        console.error('Error al eliminar datos:', error);
        this.ventana('Examen eliminado correctamente', 'OK');
        this.llenadoListaExamenes();
      }
    );
    this.llenadoListaExamenes();
  }

  clickModificarExamen() {
    console.log(this.formularioExamen.value);
    console.log(this.nivelSeleccionado);
    if (this.formularioExamen.value.idExamen == '0') {
      console.log('ID ES 0');
      this.ventana('No se puede modificar un examen con idexamen sea 0', 'ERROR');
    } else {
      this.api.getExamenIdExamen(Number(this.formularioExamen.value.idExamen)).subscribe(
        (data) => {
          console.log(data);
          if (data == null) {
            console.log('-- NO EXISTE EL USUARIO');
            this.ventana('Usuario no valido', 'ERROR');
          } else {
            if (this.formularioExamen.value.nombreExamen == '') {
              this.formularioExamen.value.nombreExamen = data.nombreExamen;
            }
            if (this.formularioExamen.value.idMateria == '') {
              this.formularioExamen.value.idMateria = data.idMateria;
            }
            if (this.nivelSeleccionado == '') {
              this.formularioExamen.value.nivel = data.nivel;
            } else {
              this.formularioExamen.value.nivel = this.nivelSeleccionado;
            }
            if (this.formularioExamen.value.tiempo == '') {
              this.formularioExamen.value.tiempo = data.tiempo;
            }
            this.agregarExamen();
          }
        },
        (error) => {
          console.error('Error fetching data list:', error);
        }
      );
    }
  }

  agregarPregunta(): void {
    console.log(this.dataPregunta);
    this.api.agregarPregunta(this.dataPregunta).subscribe(
      (response) => {
        this.llenadoListaExamenes();
      },
      (error) => {
        console.error('Error adding data:', error);
      }
    );
  }

  llenadoListaExamenes() {
    console.log('-- llenadoLista');
    this.api.getExamens().subscribe(
      (data) => {
        this.dataSourceExamenes = data;//console.log(data);
      },
      (error) => {
        console.error('Error fetching data list:', error);
      }
    );
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

  ventana(msj: string, sts: string) {
    this._snackBar.open(msj, sts, {
      duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom'
    });
  }

  invertirCadena(cadena: string): string {
    // Divide la cadena en un array de caracteres
    const caracteresArray = cadena.split('');
    // Invierte el orden de los elementos en el array
    const caracteresInvertidos = caracteresArray.reverse();
    // Une los caracteres invertidos en una nueva cadena
    const cadenaInvertida = caracteresInvertidos.join('');
    return cadenaInvertida;
  }
}
