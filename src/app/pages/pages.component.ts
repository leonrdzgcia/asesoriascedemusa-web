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
  videoSeleccionado: any;
  listaVideosAsignados: any[] = [];

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
    this.arrayExamenesInt = [];
    console.log(this.dataService);
    this.matriculaLogin = this.dataService.matricula;
    this.nombreLogin = this.dataService.nombre;
    this.obtenerasignaciones();
    this.obtenerasignacionesporMatreicula();
    this.obtenerExamenes();
    this.obtenerAsignacionesVideos();
    //this.bandera = 1;//administrador
    this.bandera=this.dataService.banderaUsuario;//estudiante
    this.cargarMenu();
    this.bandera = this.dataService.banderaUsuario;
  }

  botonActualizar(){
    this.ngOnInit();
  }

  click(num: number) {
    this.dataService.video = num;
  }

  presentarExamen() {
    console.log("---CLICK PRESENTAR ");
    console.log(this.dataService);
    console.log(this.examenSeleccionado);
    this.dataService.idExamenSeleccionado = this.examenSeleccionado.idExamen;
    this.router.navigateByUrl('/dashboard/student/examencuatro');
  }

  verVideo(){
    const videoObj = this.listaVideosAsignados.find((v: any) => v.idVideo === this.videoSeleccionado);
    if (videoObj) {
      this.dataService.examenavideo = videoObj.idVideo;
      this.dataService.nombreVideoSeleccionado = videoObj.nombreVideo;
      this.dataService.videoSeleccionado$.next(videoObj.nombreVideo);
    }
    this.router.navigateByUrl('/dashboard/student/examenvideo');
  }

  ngAfterViewInit() {
    this.observer.observe(['(max-width: 800px)']).subscribe((resp: any) => {
      if (resp.matches) {
        this.sidenav.mode = 'over';
        this.sidenav.close();
      } else {
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
        this.examenmenu = data;
      },
      (error) => {
        console.error('Error fetching data list:', error);
      }
    );
  }

  obtenerasignacionesporMatreicula() {
    this.api.getAsignacionesMatricula(this.dataService.matricula).subscribe(
      (data) => {
        this.arrayExamenes = data;
        for (let index = 0; index < data.length; index++) {
          this.arrayExamenesInt.push( { idExamen : data[index].idExamen, nombreExamen : data[index].nombreExamen });
        }
        this.examenmenu = data;
      },
      (error) => {
        console.error('Error fetching data list:', error);
      }
    );
  }

  obtenerAsignacionesVideos() {
    this.api.getAsignacionesVideosMatricula(this.dataService.matricula).subscribe(
      (data) => {
        console.log('-- getAsignacionesVideosMatricula');
        console.log(data);
        this.listaVideosAsignados = data.sort((a: any, b: any) =>
          (a.nombreVideo || '').localeCompare(b.nombreVideo || '')
        );
      },
      (error) => {
        console.error('Error fetching videos list:', error);
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
    this.dataService.limpiarSesion();
    this.router.navigateByUrl('/login');
  }
}
