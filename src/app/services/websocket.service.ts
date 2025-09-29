
import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import { IFrame } from '@stomp/stompjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private stompClient: Client | null = null;
  private roomSubscription: any = null;
  public messages$ = new Subject<any>();
  private token: string = '';

  constructor(private auth: AuthService) {}

  connectToRoom(roomCode: string): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('[WebsocketService] No access token found. Attempting to refresh token...');
      this.auth.refreshToken().subscribe({
        next: (freshToken: string) => {
          console.log('[WebsocketService] refreshToken() returned (no token):', freshToken);
          if (!freshToken) {
            console.error('[WebsocketService] Could not refresh token');
            return;
          }
          console.log('[WebsocketService] Token refreshed. Attempting WebSocket connection with new token...');
          this._connectWithToken(roomCode, freshToken);
        },
        error: (err) => {
          console.error('[WebsocketService] Token refresh failed (no token):', err);
        }
      });
      return;
    }

    let payload: any;
    try {
      payload = JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('[WebsocketService] Failed to decode token:', e);
      return;
    }
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.log('[WebsocketService] Token expired. Calling refreshToken()...');
      this.auth.refreshToken().subscribe({
        next: (freshToken: string) => {
          console.log('[WebsocketService] refreshToken() returned:', freshToken);
          if (!freshToken) {
            console.error('[WebsocketService] Could not refresh token');
            return;
          }
          console.log('[WebsocketService] Token refreshed. Reattempting WebSocket connection with new token...');
          this._connectWithToken(roomCode, freshToken);
        },
        error: (err) => {
          console.error('[WebsocketService] Refresh before WS failed:', err);
        }
      });
    } else {
      console.log('[WebsocketService] Token valid. Connecting WebSocket...');
      this._connectWithToken(roomCode, token);
    }
  }

  private _connectWithToken(roomCode: string, token: string): void {
  console.log('[WebsocketService] _connectWithToken called with token:', token);
    const base = environment.apiUrl.replace(/\/$/, '');

    this.stompClient = new Client({
      brokerURL: `${base.replace(/^http/, 'ws')}/ws?token=${encodeURIComponent(token)}`,
      reconnectDelay: 5000,
      debug: (msg: string) => console.log('[STOMP]', msg),
    });

    this.stompClient.onConnect = () => {
      console.log('[STOMP] CONNECTED');
      if (this.stompClient) {
        this.roomSubscription = this.stompClient.subscribe(`/topic/rooms/${roomCode}`, (message: IMessage) => {
          console.log('[STOMP] MESSAGE received:', message.body);
          try {
            const parsed = JSON.parse(message.body);
            this.messages$.next(parsed);
          } catch (e) {
            console.error('[STOMP] Failed to parse message body:', message.body, e);
          }
        });
      }
    };

    this.stompClient.onStompError = (frame: IFrame) => {
      console.error('[STOMP] Broker error:', frame);
      const msg = frame.headers?.['message'] ?? '';
      if (msg.includes('expired')) {
        console.log('[WebsocketService] STOMP error indicates expired token. Calling refreshToken()...');
        this.auth.refreshToken().subscribe({
          next: async (freshToken: string) => {
            console.log('[WebsocketService] refreshToken() returned (STOMP error):', freshToken);
            if (this.stompClient) {
              await this.stompClient.deactivate();
            }
            console.log('[WebsocketService] Reconnecting WebSocket with new token after STOMP error...');
            this._connectWithToken(roomCode, freshToken);
          },
          error: (err) => {
            console.error('[WebsocketService] Token refresh failed during STOMP error:', err);
          }
        });
      } else {
        console.error('[WebsocketService] Unhandled STOMP error:', msg);
      }
    };

    this.stompClient.activate();
  }

  send(destination: string, data: any): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({ destination, body: JSON.stringify(data) });
    }
  }

  disconnect(): void {
    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
      this.roomSubscription = null;
    }
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.messages$.complete();
  }

  // getToken() is now obsolete; use AuthService.getValidAccessToken()
}
