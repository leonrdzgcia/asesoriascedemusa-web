import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DataService } from '../services/data.service';
import { ExamenService } from '../services/examen.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MenuService } from '../services/menu.service';
import { Menu } from '../interfaces/menu';
import { Examenmenu } from '../interfaces/examenmenu';
import { MatSelectModule } from '@angular/material/select';
import { Examenint } from '../interfaces/examenint';


@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent {

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  bandera = 0;
  menu: Menu[] = [];
  examenmenu: Examenmenu[] = [];
  //dataSource: Usuario[] = [];
  dataSource = [];
  valdue: string | null | undefined;
  fr: any;
  matriculaLogin = '';
  nombreLogin = '';
  video = 'Seleccione'

  arrayExamenes: string[] = [];
  arrayExamenesInt: Examenint[] = [];
  examenSeleccionado: any;

  arrayVideos: Array<[number, string]> = [
    [1, "1 Sumas y Restas"],
    [2, "2 Jerarquia de Operaciones"],
    [3, "tres"],
    [4, "uno"],
    [5, "dos"],
    [6, "uno"],
    [7, "dos"],
  ];

  optionsVideos = [
    { value: '1', label: '1 Sumas y Restas' },
    { value: '2', label: '2 Jerarquia de Operaciones' },
    { value: '3', label: '3 Suma de Polinomios' },
    { value: '4', label: '4 Multiplicacion de Polinomios' },
    { value: '5', label: '5 Leyes de los exponentes' },
    { value: '6', label: '6 Funciones Lineales' },
    { value: '7', label: '7 Factorizacion de Polinomios' },
    { value: '8', label: '8 Solución de ecuaciones lineales' },
    { value: '9', label: '9 Funciones Cuadráticas' },
    { value: '10', label: '10 Solución de Ecuaciones Cuadraticas' },
    { value: '11', label: '11 Teorema de Pitagoras' },
    { value: '12', label: '12 Distancia entre puntos y PM' },
    { value: '13', label: '13 Teorema de Thales' },
    { value: '14', label: '14 Razones y proporciones' },
    { value: '15', label: '15 Rectas Paralelas y Secante' },
    { value: '16', label: '16 Razones Trigonometricas' },
    { value: '17', label: '17 Graficas con razones trigonometricas' },
    { value: '18', label: '18 Ley de los Senos y Cosenos' },
    { value: '19', label: '19 Frecuencias' },
    { value: '20', label: '20 Medidas de Posicion' },
    { value: '21', label: '21 Medidas de Dispersion' },
    { value: '22', label: '22 Sistema de ecuaciones lineales' }
  ];

  constructor(
    private observer: BreakpointObserver,
    private cd: ChangeDetectorRef,
    private dataService: DataService,
    private api: ExamenService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private menuServices: MenuService
  ) {

  }

  ngOnInit(): void {
    console.log(' -- ngOnInit PagesComponent ');
    /*console.log(this.matriculaLogin);
    console.log(this.nombreLogin);*/
    console.log(this.dataSource);
    console.log(this.arrayExamenes);
    console.log(this.arrayExamenesInt);
    this.arrayExamenesInt = [];
    console.log(this.dataService);
    console.log(this.dataService.banderaUsuario);
    console.log(this.dataService.matricula);
    this.matriculaLogin = this.dataService.matricula;

    this.nombreLogin = this.dataService.nombre;
    //console.log(this.matriculaLogin);console.log(this.nombreLogin);
    this.obtenerasignaciones();
    this.obtenerasignacionesporMatreicula();
    this.obtenerExamenes();
    //this.bandera = 1;//administrador
    this.bandera=this.dataService.banderaUsuario;//estudiante
    this.cargarMenu();
    /*console.log(this.dataService); console.log(this.dataService.perfil);this.bandera=this.dataService.perfil;
    console.log(this.bandera); console.log(this.dataService);*/
    this.bandera = this.dataService.banderaUsuario;
    console.log(this.bandera);
  }

  botonActualizar(){
    console.log("---botonActualizar");
    this.ngOnInit();

  }

  click(num: number) {
    console.log("---CLICK ROUTER", num);
    console.log(this.dataService.video);
    this.dataService.video = num;
  }

  presentarExamen() {
    console.log("---CLICK PRESENTAR ");
    console.log(this.dataService);
    console.log(this.examenSeleccionado);
    console.log(this.examenSeleccionado.idExamen);
    console.log(this.examenSeleccionado.nombreExamen);
    console.log(this.dataService.idExamenSeleccionado);
    this.dataService.idExamenSeleccionado = this.examenSeleccionado.idExamen;
    console.log(this.dataService.idExamenSeleccionado);
    this.router.navigateByUrl('/dashboard/student/examencuatro');
    //console.log(this.arrayExamenesInt);
  }

  verVideo(){
    this.dataService.examenavideo = this.examenSeleccionado;
    console.log(this.examenSeleccionado);
    console.log(this.dataService.examenavideo);
    this.router.navigateByUrl('/dashboard/student/examenvideo');
  }

  ngAfterViewInit() {
    //console.log('00')
    this.observer.observe(['(max-width: 800px)']).subscribe((resp: any) => {
      if (resp.matches) {
        console.log('11')
        this.sidenav.mode = 'over';
        this.sidenav.close();
      } else {
        //console.log('22')
        this.sidenav.mode = 'side';
        this.sidenav.open();
      }
    })
    this.cd.detectChanges();
  }

  cargarMenu() {
    console.log('----//  NavbarComponent CARGARMENU --');
    this.menuServices.getMenu().subscribe(data => {
      this.menu = data;
    })

  }

  obtenerasignaciones() {
    this.api.getAsignaciones().subscribe(
      (data) => {
        this.dataSource = data;
        console.log(data);
        this.examenmenu = data;
      },
      (error) => {
        console.error('Error fetching data list:', error);
      }
    );
  }

  obtenerasignacionesporMatreicula() {
    //console.log(this.arrayExamenesInt);
    this.api.getAsignacionesMatricula(this.dataService.matricula).subscribe(
      (data) => {
        this.arrayExamenes = data;
        console.log(data);
        for (let index = 0; index < data.length; index++) {
          this.arrayExamenesInt.push( { idExamen : data[index].idExamen, nombreExamen : data[index].nombreExamen });
        }
        this.examenmenu = data;
        console.log(this.arrayExamenesInt);
      },
      (error) => {
        console.error('Error fetching data list:', error);
      }
    );
  }

  obtenerExamenes() {
    this.api.getExamens().subscribe(
      (data) => {
        //this.arrayExamenes = data;
        for (let index = 0; index < data.length; index++) {
          this.arrayExamenes.push   ( data[index].idExamen + ' - '+ data[index].idMateria );
          //this.arrayExamenesInt.push( { idExamen : data[index].idExamen, nombreExamen : data[index].nombreExamen });
        }
      },
      (error) => {
        console.error('Error fetching data list:', error);
      }
    );
  }

  logout() {
    this.router.navigateByUrl('/login');
  }
}
