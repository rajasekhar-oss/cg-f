import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '../../services/websocket.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  state:any;
  constructor(private ws: WebsocketService, private route: ActivatedRoute){}
  ngOnInit(){
    const id = this.route.snapshot.params['id'];
    this.ws.connectToGame(id);
    this.ws.messages$.subscribe((msg: any) => {
      // handle incoming game state updates
      this.state = msg;
    });
  }
}
