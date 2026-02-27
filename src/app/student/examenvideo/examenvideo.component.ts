import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-examenvideo',
  templateUrl: './examenvideo.component.html',
  styleUrls: ['./examenvideo.component.scss']
})
export class ExamenvideoComponent implements OnInit, OnDestroy {

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  readonly baseUrl = 'https://asesoriascedemusa.com/assets/img/vid/';
  videoUrl = '';
  nombreVideo = '';

  private sub!: Subscription;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.sub = this.dataService.videoSeleccionado$.subscribe(nombre => {
      if (nombre) {
        this.nombreVideo = nombre;
        this.videoUrl = this.baseUrl + encodeURIComponent(nombre);
        // Forzar recarga del elemento <video> del navegador
        setTimeout(() => {
          if (this.videoPlayer?.nativeElement) {
            this.videoPlayer.nativeElement.load();
          }
        }, 0);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

}
