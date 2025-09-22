import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html'
})
export class WaitingRoomComponent {
  code = '';
  players: string[] = [];
  constructor(private route: ActivatedRoute, private api: ApiService){
    this.code = route.snapshot.params['code'];
    // Poll or use websocket to listen for changes — here we call join info once
    // Example: GET /api/rooms/{code}/info  (if backend provides)
  }
  start(){ this.api.post(`/api/rooms/${this.code}/start`, {}).subscribe(()=>alert('starting'), (err: any)=>alert('nope')); }
}
