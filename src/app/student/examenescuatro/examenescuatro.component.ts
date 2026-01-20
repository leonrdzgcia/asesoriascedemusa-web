import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Pregunta } from 'src/app/interfaces/pregunta';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ExamenService } from 'src/app/services/examen.service';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { Resultados } from '../../interfaces/resultados';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-examenescuatro',
  templateUrl: './examenescuatro.component.html',
  styleUrls: ['./examenescuatro.component.scss']
})
export class ExamenescuatroComponent implements OnInit {

  options: any[] = [];
  preguntas: Pregunta[] = [];
  listaRespuestas: string[] = [];
  respuestaSeleccionada: string = '';
  banderBack = true;
  banderNext = false;
  banderSend = true;
  banderaPreguntas = 0;
  totalnumeroPreguntas = 0;
  preguntasCorrectas = 0;
  preguntasIncorrectasnum = 0;
  // Array para persistir respuestas seleccionadas por el usuario
  respuestasGuardadas: string[] = [];
  //info del examen
  numeroIdExamen = '';
  nombreExamen = '';
  stringIidExamen = '';
  preguntas90 = 0;
  tiempoExamen = 0;
  //conatador
  tiempoTotal: number = 10000;///1 con tiempo, 2 sin teimpo
  minutes: number = 0;
  minutesCad: string = '';
  seconds: number = 0;
  interval: any;
  display: any;

  loading = false;

  //banderas preguntas
  srcIdEncabezado: number = 0;
  tipoRespuestas: number = 0;
  idNumeroencabezado: number = 0;
  srcPreguntaImg = '';
  srcRes1 = '';
  srcRes2 = '';
  srcRes3 = '';
  srcEncabezado = '';

  //
  msgEncabezado: string = '';
  msgResCorrectas: string = '';
  msgResIncorrectas: string = '';
  msgCalificacion: string = '';
  msgPgt: string = ' Pregunta ';
  saltos: string = 'Primera línea<br>Segunda línea<br>Tercera línea';
  salto: string = 'Primera línea\\nSegunda línea\\nTercera línea';

  //arrayPreguntasFinal : string[] = [];
  arrayPreguntasIncorrectas: string = '';
  arrayPreguntasFinal: string = '';
  matriculaLogin: string = '';
  arrayPreguntasFinalT: Resultados[] = [];

  public idRes = new FormControl('');
  public idExamen = new FormControl('');
  public matricula = new FormControl('');
  public correctas = new FormControl('');
  public incorrectas = new FormControl('');
  public totalPreguntas = new FormControl('');
  public calificacion = new FormControl('');
  public preguntasIncorrectas = new FormControl('');

  public formularioGuardarResultado = new FormGroup({
    idExamen: this.idExamen,
    matricula: this.matricula,
    correctas: this.correctas,
    incorrectas: this.incorrectas,
    totalPreguntas: this.totalPreguntas,
    calificacion: this.calificacion,
    preguntasIncorrectas: this.preguntasIncorrectas
  });


  constructor(
    private dialog: MatDialog,
    private api: ExamenService,
    private dataService: DataService,
    private dialogService: DialogService,
    private router: Router,
    private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.interval = setInterval(() => {
      this.tick();
    }, 1000);

    if (this.dataService.matricula == 0) {
      this.ventana('Favor de ingresar al portal nuevamente', 'OK');
      this.logout();


    } else {
      console.log('---  MATRICULA ES :' + this.dataService.matricula);
      console.log(this.dataService);
      console.log(this.dataService.idExamenSeleccionado);
      console.log(this.dataService.matricula);
      this.matriculaLogin = this.dataService.matricula;
      this.stringIidExamen = this.dataService.idExamenSeleccionado.toString();
      this.numeroIdExamen = '50'; // ID EXAMEN QUE SE DEBE DE RECIBIR
      this.obtenerInfoExamen();
      //console.log(this.nombreExamen);    console.log(this.tiempoExamen);    console.log(this.preguntas90);
      console.log('---  ngOnInit  examenes 4');
      console.log(this.numeroIdExamen);
      console.log(this.stringIidExamen);

      //this.api.getPreguntasIdExamen('73').subscribe(data => {
      this.api.getPreguntasIdExamen(this.dataService.idExamenSeleccionado.toString()).subscribe(data => {
        console.log(data);
        this.options = data;
        this.preguntas = data;
        this.totalnumeroPreguntas = this.preguntas.length;
        console.log(this.preguntas);//      /*console.log(this.preguntas.length);      console.log(this.preguntas[0]);      console.log(this.preguntas[0].idExamen);      console.log(this.preguntas[0].idPregunta);      console.log(this.preguntas[0].pregunta);            console.log(this.preguntas[0].correcta);      console.log(data.length); */
        console.log(this.preguntas[0].encabezado);
        this.srcEncabezado = this.preguntas[0].encabezado;
        console.log(this.preguntas[0].pregunta);//      console.log(this.preguntas[0].preguntaImagen);//      console.log(this.preguntas[0].respuesta_1);//console.log(this.preguntas[0].respuesta_2);console.log(this.preguntas[0].respuesta_3);
        this.idNumeroencabezado = this.preguntas[0].id;
        this.srcPreguntaImg = this.preguntas[0].preguntaImagen;
        console.log(this.idNumeroencabezado);//      console.log(this.srcPreguntaImg);
        this.srcRes1 = this.srcRes1 + this.preguntas[0].respuesta_1;
        this.srcRes2 = this.srcRes2 + this.preguntas[0].respuesta_2;
        this.srcRes3 = this.srcRes3 + this.preguntas[0].respuesta_3;
        //this.arrayPreguntasFinal = this.arrayPreguntasFinal + this.preguntas[0].pregunta;      console.log(this.srcRes1);//console.log(this.srcRes2);console.log(this.srcRes3);
      });
      this.srcPreguntaImg = this.srcPreguntaImg + '';
      //this.openDialogWithOptions();
      console.log(this.dataService.tiempoExamen);
      //this.arrayPreguntasFinal = this.arrayPreguntasFinal + this.preguntas[0].pregunta + '\n';
      console.log(this.arrayPreguntasFinal);
      //console.log(this.preguntas[0].pregunta);
      //this.arrayPreguntasFinal.push(this.preguntas[0].pregunta);
      //this.arrayPreguntasFinal = this.arrayPreguntasFinal + this.preguntas[0].pregunta + '\n';
      //this.openDialogAndWaitForResponse();
      //this.startTimer();
      //this.idNumeroencabezado


    }
  }

  async obtenerInfoExamen() {
    this.api.getExamenIdExamen(Number(this.numeroIdExamen)).subscribe(
      (data) => {
        console.log(data);
        if (data == null) {
          console.log('-- NO EXISTE EL examen');
        } else {
          this.nombreExamen = data.nombreExamen;
          this.tiempoExamen = data.tiempo;
          this.preguntas90 = data.preguntas90;
          console.log(this.nombreExamen);
          console.log(this.tiempoExamen);
          this.tiempoTotal = this.tiempoExamen;
          console.log(this.tiempoTotal);
          console.log(this.preguntas90);
        }
      },
      (error) => {
        console.error('Error fetching data list:', error);
      }
    );
  }

  /**
   * Valida la respuesta seleccionada y la registra en el array de resultados
   */
  private procesarRespuesta(): void {
    // Verificar si esta pregunta ya fue procesada (evitar duplicados al retroceder)
    const yaExisteResultado = this.arrayPreguntasFinalT.some(r => r.idPregunta === this.banderaPreguntas + 1);

    if (yaExisteResultado) {
      console.log(`Pregunta ${this.banderaPreguntas + 1} ya procesada, no se duplica`);
      return;
    }

    // Preparar lista de respuestas de la pregunta actual
    this.listaRespuestas.push(this.preguntas[this.banderaPreguntas].respuesta_1);
    this.listaRespuestas.push(this.preguntas[this.banderaPreguntas].respuesta_2);
    this.listaRespuestas.push(this.preguntas[this.banderaPreguntas].respuesta_3);

    // Obtener respuesta correcta
    const indiceRespuestaCorrecta = Number(this.preguntas[this.banderaPreguntas].correcta) - 1;
    const respuestaCorrecta = this.listaRespuestas[indiceRespuestaCorrecta];

    console.log(`Respuesta seleccionada: "${this.respuestaSeleccionada}"`);
    console.log(`Respuesta correcta: "${respuestaCorrecta}"`);

    // Validar y registrar resultado
    const esCorrecta = this.respuestaSeleccionada === respuestaCorrecta;

    this.arrayPreguntasFinalT?.push({
      idPregunta: this.banderaPreguntas + 1,
      pregunta: this.preguntas[this.banderaPreguntas].pregunta,
      tipoRespuesta: this.preguntas[this.banderaPreguntas].tipoRespuestas,
      correcta: esCorrecta,
      respuestaCorrecta: respuestaCorrecta,
      respuestaIncorrecta: esCorrecta ? 'NA' : this.respuestaSeleccionada
    });

    if (esCorrecta) {
      console.log('✓ RESPUESTA CORRECTA');
      this.arrayPreguntasFinal += `- respuesta correcta = ${this.respuestaSeleccionada}\n`;
      this.preguntasCorrectas++;
    } else {
      console.log('✗ RESPUESTA INCORRECTA');
      this.arrayPreguntasIncorrectas += `${this.banderaPreguntas + 1},`;
      this.preguntasIncorrectasnum++;
    }

    // Limpiar lista temporal
    this.listaRespuestas = [];
  }

  /**
   * Actualiza el encabezado de la pregunta actual
   * Solo muestra encabezado si existe y es diferente al anterior
   */
  private actualizarEncabezado(indicePregunta: number): void {
    const preguntaActual = this.preguntas[indicePregunta];

    // Si el encabezado es 'NA', no mostrar nada
    if (preguntaActual.encabezado === 'NA') {
      this.srcEncabezado = 'NA';
      console.log('Encabezado: NA (no se muestra)');
      return;
    }

    // Si el encabezado es diferente al anterior, actualizarlo
    if (preguntaActual.id !== this.idNumeroencabezado) {
      this.srcEncabezado = preguntaActual.encabezado;
      this.idNumeroencabezado = preguntaActual.id;
      console.log(`Nuevo encabezado ID ${this.idNumeroencabezado}: ${this.srcEncabezado.substring(0, 50)}...`);
    } else {
      console.log(`Encabezado ID ${this.idNumeroencabezado} se mantiene (preguntas relacionadas)`);
    }
  }

  /**
   * Carga los datos de la pregunta (imagen y respuestas)
   */
  private cargarDatosPregunta(indicePregunta: number): void {
    const preguntaActual = this.preguntas[indicePregunta];

    this.srcPreguntaImg = preguntaActual.preguntaImagen;
    this.srcRes1 = preguntaActual.respuesta_1;
    this.srcRes2 = preguntaActual.respuesta_2;
    this.srcRes3 = preguntaActual.respuesta_3;
  }

  preguntaAnterior() {
    this.banderNext = false;
    this.banderSend = true;

    console.log('Retrocediendo desde pregunta:', this.banderaPreguntas);
    this.banderaPreguntas--;

    // Restaurar respuesta guardada de la pregunta anterior
    this.respuestaSeleccionada = this.respuestasGuardadas[this.banderaPreguntas] || '';

    // Actualizar encabezado si es necesario
    this.actualizarEncabezado(this.banderaPreguntas);

    // Cargar datos de la pregunta
    this.cargarDatosPregunta(this.banderaPreguntas);

    if (this.banderaPreguntas == 0) {
      console.log('Primera pregunta alcanzada');
      this.banderBack = true;
    }
  }

  siguientePRegunta() {
    // Guardar respuesta actual antes de avanzar
    this.respuestasGuardadas[this.banderaPreguntas] = this.respuestaSeleccionada;

    console.log('Avanzando desde pregunta:', this.banderaPreguntas);

    this.arrayPreguntasFinal = this.arrayPreguntasFinal + ' Pregunta ' + (this.banderaPreguntas + 1).toString() + ' -' + this.preguntas[this.banderaPreguntas].pregunta + '\n';

    this.banderBack = false;

    // Procesar la respuesta de la pregunta actual
    this.procesarRespuesta();

    // Avanzar a la siguiente pregunta
    this.banderaPreguntas++;

    // Verificar si llegamos a la última pregunta
    if (this.banderaPreguntas == (this.totalnumeroPreguntas - 1)) {
      console.log('Última pregunta alcanzada');
      this.banderNext = true;
      this.banderSend = false;
    } else {
      // Restaurar respuesta guardada de la siguiente pregunta si existe
      this.respuestaSeleccionada = this.respuestasGuardadas[this.banderaPreguntas] || '';
      this.banderSend = true;
    }

    // Actualizar encabezado de la siguiente pregunta
    this.actualizarEncabezado(this.banderaPreguntas);

    // Cargar datos de la siguiente pregunta
    this.cargarDatosPregunta(this.banderaPreguntas);
  }

  enviarUltimaPregunta() {
    // Guardar respuesta de la última pregunta
    this.respuestasGuardadas[this.banderaPreguntas] = this.respuestaSeleccionada;

    console.log('Enviando última pregunta:', this.banderaPreguntas + 1);

    // Agregar pregunta al resumen
    this.arrayPreguntasFinal = this.arrayPreguntasFinal + ' Pregunta ' + (this.banderaPreguntas + 1).toString() + ' -' + this.preguntas[this.banderaPreguntas].pregunta + '\n';

    // Procesar respuesta usando el método helper
    this.procesarRespuesta();

    console.log('Resultados finales:', this.arrayPreguntasFinalT);

    // Calificar examen
    this.calificar();
  }

  calificar() {
    var res = 0;
    var resT = 0;
    console.log(this.arrayPreguntasFinalT);
    console.log(this.preguntas[this.banderaPreguntas].pregunta);

    // Recalcular correctas e incorrectas desde arrayPreguntasFinalT para evitar duplicados
    this.preguntasCorrectas = this.arrayPreguntasFinalT.filter(r => r.correcta === true).length;
    this.preguntasIncorrectasnum = this.arrayPreguntasFinalT.filter(r => r.correcta === false).length;

    console.log(' -- preguntasCorrectas   son = ' + this.preguntasCorrectas);
    console.log(' -- preguntasIncorrectas son = ' + this.preguntasIncorrectasnum);
    console.log(this.totalnumeroPreguntas);

    if (this.totalnumeroPreguntas == 90) {
      console.log('-- EXAMEN SIMULACION DE 90 PREGUNTAS');

      var puntosBase = 700;
      this.msgEncabezado = 'Resultado obtenido :  Total de preguntas ' + this.totalnumeroPreguntas;
      this.msgResCorrectas = 'Preguntas contestadas correctamente : ' + this.preguntasCorrectas.toString();
      this.msgResIncorrectas = 'Preguntas contestadas incorrectamente : ' + this.preguntasIncorrectasnum.toString();
      res = puntosBase + (this.preguntasCorrectas * 6.6);
      resT = Number(res.toFixed(2)); // Trunca a 2 decimales

      console.log(res);
      this.msgCalificacion = 'Calificacion obtenida : ' + resT.toString() + ' de 1300 ';
    } else {
      console.log('-- EXAMEN BASE 100 % ');

      this.msgEncabezado = 'Resultado obtenido :  Total de preguntas ' + this.totalnumeroPreguntas;
      this.msgResCorrectas = 'Preguntas contestadas correctamente : ' + this.preguntasCorrectas.toString();
      this.msgResIncorrectas = 'Preguntas contestadas incorrectamente : ' + this.preguntasIncorrectasnum.toString();
      res = 100 / this.totalnumeroPreguntas * this.preguntasCorrectas;
      resT = Number(res.toFixed(2)); // Trunca a 2 decimales
      console.log(res);
      this.msgCalificacion = 'Calificacion obtenida : ' + resT.toString() + ' de 100 ';
    }
    console.log(this.msgResCorrectas);
    console.log(this.msgResIncorrectas);
    console.log(this.msgCalificacion);
    console.log(this.arrayPreguntasFinal);

    console.log('CADENA DE PREGUNTAS = ');
    console.log(this.arrayPreguntasIncorrectas);
    this.formularioGuardarResultado.value.idExamen = this.stringIidExamen;
    this.formularioGuardarResultado.value.matricula = this.matriculaLogin;
    this.formularioGuardarResultado.value.correctas = this.preguntasCorrectas.toString();
    this.formularioGuardarResultado.value.totalPreguntas = this.totalnumeroPreguntas.toString();
    this.formularioGuardarResultado.value.incorrectas = this.preguntasIncorrectasnum.toString();
    this.formularioGuardarResultado.value.calificacion = res.toString();
    this.formularioGuardarResultado.value.preguntasIncorrectas = this.arrayPreguntasIncorrectas;

    //GUARDAR RESULTADOS
    console.log(this.formularioGuardarResultado.value);
    this.api.guardarResultado(this.formularioGuardarResultado.value).subscribe(
      (response) => {
        console.log('Data added successfully:', response);
        this.ventana('EXAMEN FINALIZADO EXITOSAMENTE', 'OK');


        //this.llenadoListaUsuarios();
      }, (error) => {
        console.error('Error adding data:', error);
      }
    );
    this.abrirMensajeResultados();//this.ventana('Respuestas correctas :' + this.preguntasCorrectas + ' / Respuestas incorrectas ' + this.preguntasIncorrectas, 'OK');
  }

  /*getStringsWithLineBreaks(): string {
    // Unir los elementos del array en una sola cadena con saltos de línea
    return this.arrayPreguntasFinal.join('\n');  }*/

  abrirMensajeResultados(): void {
    console.log(this.arrayPreguntasFinalT);
    this.dialog.open(MessageDialogComponent, {
      width: '1200px', // Ancho del diálogo
      height: '1000px',
      data: {
        encabezado: this.msgEncabezado,
        message: this.msgResCorrectas,
        message1: this.msgResIncorrectas,
        message2: this.msgCalificacion,
        message3: this.arrayPreguntasFinalT
      }
    });
  }

  async openDialogAndWaitForResponse(): Promise<void> {
    const respuesta = await this.dialogService.openDialogAndGetResponse();
    console.log('Respuesta del usuario:', respuesta);
    /*console.log(this.dataService.tiempoExamen);
    console.log(this.dataService.tiempoExamen);*/
    if (this.dataService.tiempoExamen == 1) {
      console.log('tiempoExamen == 1 ');
      this.startTimer();

    } else {
      if (this.dataService.tiempoExamen == 2) {
        console.log('tiempoExamen == 2 ');
      }
    }
  }

  async openDialogAndWaitForResponseM(): Promise<void> {
    const respuesta = await this.dialogService.openDialogAndGetResponseM();
    console.log('Respuesta del usuario:', respuesta);
    console.log(this.dataService.tiempoExamen);
    console.log(this.dataService.tiempoExamen);
  }

  openDialogWithOptions(): void {
    console.log('---  openDialogWithOptions 4');
    /*const options = ['Opción 1', 'Opción 2', 'Opción 3'];
    this.dialogService.openDialog(options);
    console.log(this.dialogService.openDialog(options));*/
    //this.dialogService.openDialogWithTimer('Este diálogo se cerrará en 5 segundos.', 15000);
  }

  startTimer() {
    console.log('---  startTimer 4', this.tiempoTotal);
    this.interval = setInterval(() => {
      if (this.tiempoTotal === 0) {
        //console.log(this.tiempoTotal);
      } else {
        //console.log(this.tiempoTotal);
        this.tiempoTotal--;
        if (this.tiempoTotal == 0) {
          this.fakeLoading();
        }
      }
      this.display = this.transform(this.tiempoTotal)
    }, 1000);
  }

  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    this.minutesCad = this.minutes.toString();
    /*console.log(this.minutes);
    console.log(this.minutesCad);
    console.log(this.minutesCad.length);*/
    //console.log(this.minutes);
    return minutes + ':' + (value - minutes * 60);
  }

  fakeLoading() {
    this.loading = true;
    setTimeout(() => {
      this.router.navigate(['login']);
      //this.loading = false;
    }, 1500);
  }

  ventana(msj: string, sts: string) {
    this._snackBar.open(msj, sts, {
      duration: 10000, horizontalPosition: 'center', verticalPosition: 'bottom'
    });
  }

  tick() {
    this.seconds++;
    if (this.seconds === 60) {
      this.seconds = 0;
      this.minutes++;
      //console.log(this.minutes);
    }
  }

  logout() {
    this.router.navigateByUrl('/login');
  }
}
