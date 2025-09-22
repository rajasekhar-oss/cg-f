import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ApiService } from '../../services/api.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  standalone: true,
  imports: [CommonModule, DragDropModule],
  selector: 'app-arrange',
  templateUrl: './arrange.component.html'
})
export class ArrangeComponent {
  cards:any[] = [];
  constructor(private api: ApiService){
    this.api.get('/cards/my').subscribe((r:any)=> this.cards = r.sort((a: any, b: any)=>a.orderIndex-b.orderIndex));
  }
  drop(e:CdkDragDrop<any[]>) { moveItemInArray(this.cards, e.previousIndex, e.currentIndex); }
  save(){
    const order = this.cards.map(c=>c.id);
    this.api.post('/cards/arrange', { cardOrder: order }).subscribe(()=> alert('saved'), (err: any)=> alert('err'));
  }
}
