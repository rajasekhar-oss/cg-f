import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import { IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class WebsocketService implements OnDestroy {
  private stompClient: Client | null = null;
  private roomSubscription: any = null;
  public messages$ = new Subject<any>();
  private token: string = '';

  connectToRoom(roomCode: string) {
    this.token = this.getToken();
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${environment.apiUrl}/ws`),
      connectHeaders: { Authorization: `Bearer ${this.token}` },
      reconnectDelay: 5000,
      debug: (msg) => console.log('[STOMP]', msg),
      onConnect: () => {
        console.log('STOMP connected');
        if (this.roomSubscription) {
          this.roomSubscription.unsubscribe();
        }
        this.roomSubscription = this.stompClient?.subscribe(`/topic/rooms/${roomCode}`, (message: IMessage) => {
          try {
            this.messages$.next(JSON.parse(message.body));
          } catch (e) {
            this.messages$.next(message.body);
          }
        });
      },
      onStompError: (frame: IFrame) => {
        console.error('Broker reported error:', frame.headers['message']);
        console.error('Additional details:', frame.body);
      }
    });
    this.stompClient.activate();
  }

  send(destination: string, data: any) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({ destination, body: JSON.stringify(data) });
    }
  }

  disconnect() {
    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
      this.roomSubscription = null;
    }
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  ngOnDestroy() {
    this.disconnect();
    this.messages$.complete();
  }

  private getToken(): string {
    // Replace with your actual token retrieval logic
    return localStorage.getItem('access_token') || '';
  }
}
