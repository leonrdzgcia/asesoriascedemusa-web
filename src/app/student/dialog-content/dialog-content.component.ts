import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-dialog-content',
  templateUrl: './dialog-content.component.html',
  styleUrls: ['./dialog-content.component.scss']
})
export class DialogContentComponent {
  respuesta: string = '';
  constructor(@Inject(MAT_DIALOG_DATA) public options: any, private dataService: DataService) {
  }
  contiempo(){
    console.log('---  con tiempo ');
    console.log(this.dataService.tiempoExamen);
    this.dataService.tiempoExamen=1;
    console.log(this.dataService.tiempoExamen);
  }
  sintiempo(){
    console.log('---  sin tiempo ');
    console.log(this.dataService.tiempoExamen);
    this.dataService.tiempoExamen=2;
    console.log(this.dataService.tiempoExamen);
  }
}
