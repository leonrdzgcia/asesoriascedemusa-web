import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsignacionesComponent } from './asignaciones/asignaciones.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ExamenesComponent } from './examenes/examenes.component';
import { PreguntasComponent } from './preguntas/preguntas.component';
import { ExamenestresComponent } from './examenescuatro/examenestres/examenestres.component';
import { ExamenescuatroComponent } from './examenescuatro/examenescuatro.component';
import { ExamenvideoComponent } from './examenvideo/examenvideo.component';
import { ExamenvideodosComponent } from './examenvideodos/examenvideodos.component';
import { ExamenvideotresComponent } from './examenvideotres/examenvideotres.component';
import { ExamenvideocuatroComponent } from './examenvideocuatro/examenvideocuatro.component';
import { ResultadosComponent } from './resultados/resultados.component';
import { ArchivosComponent } from './archivos/archivos.component';
import { CatalogovideosComponent } from './catalogovideos/catalogovideos.component';
import { VideosComponent } from './videos/videos.component';


const routes: Routes = [
  { path: 'resultados', component: ResultadosComponent },
  { path: 'asignaciones', component: AsignacionesComponent },
  { path: 'catalogovideos', component: CatalogovideosComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'examenes', component: ExamenesComponent },
  { path: 'preguntas', component: PreguntasComponent },
  { path: 'archivos', component: ArchivosComponent },
  { path: 'videos', component: VideosComponent },
  { path: 'examencuatro', component: ExamenescuatroComponent },

  { path: 'examentres', component: ExamenestresComponent },

  { path: 'examenvideo', component: ExamenvideoComponent },
  { path: 'examenvideodos', component: ExamenvideodosComponent },
  { path: 'examenvideotres', component: ExamenvideotresComponent },
  { path: 'examenvideocuatro', component: ExamenvideocuatroComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
