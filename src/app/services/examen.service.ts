import { ObserversModule } from '@angular/cdk/observers';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../interfaces/usuario';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExamenService {

  private apiUrl = `${environment.serverApiUrl}`;
  //private apiUrl = 'http://localhost:8080'; // Reemplaza esto con tu URL de la API
  constructor( private http: HttpClient ) { }

  // --------------------------------------------API ftp
  cargarArchivos(file: File, src: string | number, video?: string, catalogo?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('src', src.toString());
    if (video) { formData.append('video', video); }
    if (catalogo) { formData.append('catalogo', catalogo); }
    return this.http.post(`${this.apiUrl}/upload`, formData, { responseType: 'text' });
  }
  // --------------------------------------------API Archivos
  getArchivos(src?: number): Observable<any> {
    console.log('-- getArchivos');
    console.log(this.apiUrl);
    if (src !== undefined) {
      return this.http.get<any>(`${this.apiUrl}/archivos?src=${src}`);
    }
    return this.http.get<any>(`${this.apiUrl}/archivos`);
  }

  // --------------------------------------------API Videos
  getVideos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/videos`);
  }
  agregarVideo(videoData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/videos`, videoData);
  }

  // --------------------------------------------API ASIGNACIONES VIDEOS
  getAsignacionesVideosMatricula(matricula: string): Observable<any> {
    console.log('getAsignacionesVideosMatricula');
    console.log(this.apiUrl);
    return this.http.get(`${this.apiUrl}/asignacionesvideos/matricula?matricula=${matricula}`);
  }
  guardarAsignacionVideo(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/asignacionesvideos`, data);
  }
  // --------------------------------------------API CATALOGO VIDEOS
  getCatalogos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/catalogos`);
  }
  agregarCatalogo(newData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/catalogos`, newData);
  }
  actualizarCatalogo(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/catalogos/${id}`, data);
  }
  eliminarCatalogo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/catalogos/${id}`);
  }

  // --------------------------------------------API ASIGNACIONES
  getAsignaciones(): Observable<any> {
    //return this.http.get<Menu[]>('./assets/data/menu.json');
    return this.http.get(`${this.apiUrl}/asignaciones`);
  }

  getAsignacionesMatricula(matricula: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/asignaciones/matricula?matricula=${matricula}`);
  }

  agregarAsignacion(newData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/asignaciones`, newData);
  }

  // --------------------------------------------API USUARIOS
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios`);
  }
  getUsuarioMatricula(matricula: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuarios/matricula?matricula=${matricula}`);
  }

  getUsuarioID(id: Number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuarios/idUsuario?idUsuario=${id}`);
  }
  agregarUsuario(newData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios`, newData);
  }

  eliminarUsuario(id: number): Observable<any> {
    const url = `${this.apiUrl}/usuarios/${id}`;
    return this.http.delete(url);
  }

  // --------------------------------------------API EXAMENES
  getExamens(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/examen`);
  }

  getExamensNivel(nivel: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/examen/nivel?nivel=${nivel}`);
  }

  getExamenIdExamen(idExamen: Number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/examen/${idExamen}`);
  }

  agregarExamen(newData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/examen`, newData);
  }

  eliminarExamen(id: number): Observable<any> {
    const url = `${this.apiUrl}/examen/${id}`;
    return this.http.delete(url);
  }

  //API RESULTADOS
  getResultados(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/resultado`);
  }

  guardarResultado(newData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/resultado`, newData);
  }

  downloadCSV(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/resultado` ,{ observe: 'body' })
  }

  // ----------- API PREGUNTAS
  getPreguntas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pregunta`);
  }

  getPreguntasId(idPregunta: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pregunta/${idPregunta}`);
  }
  getPreguntasIdExamen(idExamen: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pregunta/idExamen?idExamen=${idExamen}`);
  }

  agregarPregunta(newData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pregunta`, newData);
  }

  eliminarPregunta(id: number): Observable<any> {
    const url = `${this.apiUrl}/pregunta/${id}`;
    return this.http.delete(url);
  }
}
