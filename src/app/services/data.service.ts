import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class DataService {

  public matricula: any;
  public nombre: any;
  public apellidopaterno: any;
  public apellidomaterno: any;
  public email: any;
  public pass: any;
  public celular: any;
  public nivel: any;
  public fechaAlta: any;
  public fechaBaja: any;
  public examenasignado: any;
  public examenavideo: number ;
  public idExamenSeleccionado: number;  
  public perfil: any;
  public examen1: any;
  public examen2: any;
  public examen3: any;
  public banderaUsuario: any;
  public tiempoExamen:number = 0; ///1 con tiempo, 2 sin teimpo
  public video: any;
  public nombreVideoSeleccionado: string = '';
  public videoSeleccionado$ = new BehaviorSubject<string>('');

  constructor() {
    this.matricula = 0;
    this.nombre = 'jonathan Sanchez';
    this.apellidopaterno = 'P';
    this.apellidomaterno = 'M';
    this.pass= '';
    this.email = '';
    this.celular = '';
    this.nivel = 'Facultad';
    this.fechaAlta = '';
    this.fechaBaja = '';
    this.examenasignado = 26;
    this.examenavideo= 0;
    this.idExamenSeleccionado= 0;
    this.perfil = 'NA';
    this.examen1 = 0;
    this.examen1 = 0;
    this.examen3 = 3;
    this.banderaUsuario = 1;
    this.video= 0;
    // Restaurar sesión desde localStorage si existe
    this.cargarSesion();
  }

  cargarSesion(): void {
    const sesion = localStorage.getItem('cedemusa_sesion');
    if (sesion) {
      try {
        const datos = JSON.parse(sesion);
        this.banderaUsuario = datos.banderaUsuario ?? this.banderaUsuario;
        this.perfil       = datos.perfil       ?? this.perfil;
        this.matricula    = datos.matricula     ?? this.matricula;
        this.nombre       = datos.nombre        ?? this.nombre;
      } catch (e) {
        localStorage.removeItem('cedemusa_sesion');
      }
    }
  }

  guardarSesion(): void {
    const datos = {
      banderaUsuario: this.banderaUsuario,
      perfil:         this.perfil,
      matricula:      this.matricula,
      nombre:         this.nombre
    };
    localStorage.setItem('cedemusa_sesion', JSON.stringify(datos));
  }

  limpiarSesion(): void {
    localStorage.removeItem('cedemusa_sesion');
  }

}
