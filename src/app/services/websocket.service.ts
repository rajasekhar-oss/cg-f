import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class WebsocketService {
  private socket: WebSocket | null = null;
  public messages$ = new Subject<any>();

  connectToGame(gameId: string) {
    if (this.socket) this.socket.close();
    const url = `${environment.wsUrl}/game/${gameId}`; // adapt server path
    this.socket = new WebSocket(url);
    this.socket.onopen = () => console.log('WS open');
    this.socket.onmessage = (ev) => {
      try { this.messages$.next(JSON.parse(ev.data)); } catch(e){ this.messages$.next(ev.data); }
    };
    this.socket.onclose = ()=> console.log('WS closed');
  }

  send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  disconnect() { if (this.socket) this.socket.close(); this.socket = null; }
}
