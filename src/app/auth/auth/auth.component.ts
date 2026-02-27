import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Examen } from 'src/app/interfaces/examen';
import { Examenmenu } from 'src/app/interfaces/examenmenu';
import { DataService } from 'src/app/services/data.service';
import { ExamenService } from 'src/app/services/examen.service';
import { Usuario } from '../../interfaces/usuario';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  formLogin: FormGroup;
  loading = false;
  dataSource: any[] = [];
  valdue!: string | null;
  opciones: string[] = [];
  opcionesD: string[][] = [["matricula", "nombre", "pass", "nivel"],];
  dataUsuario: Usuario[] = [];
  banderaUsuario = false;

  usuarioAdminDB = '';
  usuarioPassDB = '';

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private api: ExamenService,
    private _snackBar: MatSnackBar,
    private router: Router) {
    this.formLogin = this.fb.group({
      usuario: ['', Validators.required],
      pass: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log(this.dataService);
    console.log('-- ngOnInit LOGIN');
    this.cambiarVariableGlobal();
    this.obtenerUsuarios();
    this.obtenerUsuariosMatriculas();
    console.log('-- ngOnInit LOGIN');
  }

  datosUsuario() {
    const usuario = this.formLogin.value.usuario;
    const pass = this.formLogin.value.pass;
    // Mostrar spinner inmediatamente
    this.loading = true;
    // Validar usuario ADMIN
    if (usuario === 'admin') {
      this.api.getUsuarioMatricula(usuario).subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.dataUsuario = data;
            this.usuarioAdminDB = this.dataUsuario[0].matricula;
            this.usuarioPassDB = this.dataUsuario[0].pass;
            if (usuario === this.usuarioAdminDB && pass === this.usuarioPassDB) {
              console.log('-- ADMIN okey');
              this.dataService.banderaUsuario = 1;
              this.dataService.perfil = 'admin';
              this.dataService.nombre = 'Jonathan Sanchez';
              this.dataService.matricula = 'admin';
              this.dataService.guardarSesion();
              // Mantener loading true para la navegación
              setTimeout(() => {
                this.router.navigate(['dashboard']);
              }, 1500);
            } else {
              this.loading = false;
              this.ventana('Contraseña incorrecta', 'Admin');
            }
          } else {
            this.loading = false;
            this.ventana('Usuario no encontrado', 'ERROR');
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error fetching admin data:', error);
          this.ventana('Error al conectar con el servidor', 'ERROR');
        }
      });
    } else {
      // Validar usuario NORMAL
      this.validarUsuarioNormal(usuario, pass);
    }
  }

  validarUsuarioNormal(usuario: string, pass: string) {
    // Buscar usuario en el array opcionesD
    let usuarioEncontrado = false;
    for (let index = 0; index < this.opcionesD.length; index++) {
      if (usuario === this.opcionesD[index][0]) {
        usuarioEncontrado = true;
        this.dataService.banderaUsuario = 2;
        this.dataService.perfil = 'user';
        this.dataService.matricula = this.opcionesD[index][0];
        this.dataService.nombre = this.opcionesD[index][1];
        break;
      }
    }
    if (usuarioEncontrado) {
      // Obtener y validar contraseña del usuario
      this.api.getUsuarioMatricula(usuario).subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.dataUsuario = data;
            this.usuarioAdminDB = this.dataUsuario[0].matricula;
            this.usuarioPassDB = this.dataUsuario[0].pass;
            if (usuario === this.usuarioAdminDB && pass === this.usuarioPassDB) {
              console.log('--- USUARIO PASS USER CORRECTO');
              this.dataService.guardarSesion();
              // Mantener loading true para la navegación
              setTimeout(() => {
                this.router.navigate(['dashboard']);
              }, 1500);
            } else {
              this.loading = false;
              this.ventana('Contraseña incorrecta', 'User');
            }
          } else {
            this.loading = false;
            this.ventana('Usuario no encontrado', 'ERROR');
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error fetching user data:', error);
          this.ventana('Error al conectar con el servidor', 'ERROR');
        }
      });
    } else {
      this.loading = false;
      this.ventana('La matrícula no existe', 'ERROR');
    }
  }

  obtenerUsuariosMatriculas() {
    //console.log(this.listaUsuarios);
    this.api.getUsuarios().subscribe(
      (data) => {
        //this.dataSource = data;
        //this.opciones = data;
        //console.log(data);
        console.log(data.length);
        for (let index = 0; index < data.length; index++) {
          //console.log(data[index].matricula);
          this.opciones.push(data[index].matricula);
          this.opcionesD.push(
            [
              data[index].matricula, data[index].nombre + ' ' + data[index].apellidopaterno,
              data[index].pass, data[index].nivel
            ]
          );
        }
        //console.log(this.opcionesD);
      },
      (error) => {
        console.error('Error fetching data list:', error);
      }
    );
  }

  obtenerUsuarios() {
    this.api.getUsuarios().subscribe(
      (data) => {
        this.dataSource = data;
        console.log(data);
      },
      (error) => {
        console.error('Error fetching data list:', error);
      }
    );
  }

  cambiarVariableGlobal() {
    console.log(this.dataService);
    console.log(this.dataService.nombre);
    console.log(this.dataService.examenasignado);
  }

  limpiar() {
    this.formLogin.reset();
  }

  error() {
    this.limpiar();
    this._snackBar.open('Usuario incorrecto', 'ERROR', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    })
  }

  ventana(msj: string, sts: string) {
    this._snackBar.open(msj, sts, {
      duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom'
    });
  }
}
