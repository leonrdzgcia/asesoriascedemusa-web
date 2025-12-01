import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { ExamenService } from 'src/app/services/examen.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.scss']
})
export class ResultadosComponent {
  dataResultados: any[] = [];
  todosLosResultados: any[] = [];
  listaExamenes: any[] = [];
  examenSeleccionado: number | null = null;
  displayedColumns: string[] = ['idExamen', 'matricula', 'calificacion', 'correctas', 'incorrectas', 'totalPreguntas'
    , 'preguntasIncorrectas'
  ];

  constructor(
    private api: ExamenService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private router: Router,
    private dataService: DataService) {
  }

  ngOnInit(): void {
    console.log('-- ngOnInit ResultadosComponent');
    if (this.dataService.matricula == 0) {
      this.ventana('Favor de ingresar al portal nuevamente', 'OK');
      this.logout();
    } else {
      this.obtenerResultados();
      this.cargarExamenes();
    }

  }

  obtenerResultados() {
    this.api.getResultados().subscribe(
      (data) => {
        this.todosLosResultados = data;
        this.dataResultados = data;
        console.log('Resultados obtenidos:', data);
        console.log('Total de resultados:', data.length);

      },
      (error) => {
        console.error('Error fetching data list:', error);
      }
    );

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
    console.log( '//filtrarPorExamen' );
    console.log(this.examenSeleccionado);
    console.log();
    console.log();
    if (this.examenSeleccionado === null) {
      console.log( '// 1');
      // Mostrar todos los resultados
      this.dataResultados = this.todosLosResultados;
      console.log('Mostrando todos los resultados');
    } else {
      console.log( '// 2 tdos res');
      console.log(this.todosLosResultados);

      // Filtrar por examen seleccionado
      const resultadosFiltrados = this.todosLosResultados.filter(
        resultado => resultado.idExamen === this.examenSeleccionado?.toString()
      );
      this.dataResultados = resultadosFiltrados;
      console.log('Filtrando por examen ID:', this.examenSeleccionado);
      console.log('Resultados filtrados:', resultadosFiltrados.length);
    }
  }

  clickDescarga() {
    if (this.dataResultados.length === 0) {
      this.ventana('No hay datos para descargar', 'ERROR');
      return;
    }

    console.log('Descargando datos mostrados en tabla:', this.dataResultados);

    // Generar hoja de Excel con los datos actualmente mostrados en la tabla
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataResultados);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados');

    // Nombre del archivo con fecha y filtro si aplica
    const fecha = new Date().toISOString().split('T')[0];
    let nombreArchivo = `Resultados_${fecha}`;

    if (this.examenSeleccionado !== null) {
      nombreArchivo += `_Examen_${this.examenSeleccionado}`;
    }

    XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
    this.ventana('Archivo Excel descargado correctamente', 'OK');
  }
  ventana(msj: string, sts: string) {
    this._snackBar.open(msj, sts, {
      duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom'
    });
  }
  logout() {
    this.router.navigateByUrl('/login');
  }
}
