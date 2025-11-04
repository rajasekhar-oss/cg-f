import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { IFrame } from '@stomp/stompjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import * as SockJS from 'sockjs-client';
import {
    WebSocketMessage,
    getMessageTypeFromTopic,
    isGameStartMessage,
    isRoomInfoMessage,
    isGameStateMessage,
    isStartGameBundleMessage
} from '../models/websocket.types';

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private stompClient: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  public messages$ = new Subject<any>();
  private token: string = '';
  private connectionStatus$ = new BehaviorSubject<boolean>(false);
  private queuedTopics: string[] = [];

  constructor(private auth: AuthService) {}


  connectToRoom(roomCode: string): void {
    // Only for waiting room: subscribe to /topic/rooms/{roomCode}
    this.connectAndSubscribe(`/topic/rooms/${roomCode}`);
  }

  connectAndSubscribe(topic: string): void {
    // If already connected, subscribe immediately
    if (this.stompClient && this.connectionStatus$.getValue()) {
      this._subscribeToTopic(topic);
      return;
    }
    // Otherwise, queue the topic and connect if not already connecting
    if (!this.queuedTopics.includes(topic)) {
      this.queuedTopics.push(topic);
    }
    if (!this.stompClient) {
      const token = this.auth.getAccessToken();
      if (!token) {
        console.warn('[WebsocketService] No access token found. Attempting to refresh token...');
        this.auth.refreshToken().subscribe({
          next: (freshToken: string) => {
            if (!freshToken) {
              console.error('[WebsocketService] Could not refresh token');
              return;
            }
            this._connectWithTokenAndSubscribeQueued(freshToken);
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
        this.auth.refreshToken().subscribe({
          next: (freshToken: string) => {
            if (!freshToken) {
              console.error('[WebsocketService] Could not refresh token');
              return;
            }
            this._connectWithTokenAndSubscribeQueued(freshToken);
          },
          error: (err) => {
            console.error('[WebsocketService] Refresh before WS failed:', err);
          }
        });
      } else {
        this._connectWithTokenAndSubscribeQueued(token);
      }
    }
    // If stompClient is connecting, queuedTopics will be processed on connect
  }

  private _connectWithTokenAndSubscribeQueued(token: string): void {
    // Prefer explicit wsUrl from environment if provided (avoids double-slash or wrong host)
    const wsBase = (environment as any).wsUrl ? (environment as any).wsUrl.replace(/\/$/, '') : null;
    const base = environment.apiUrl.replace(/\/$/, '');
    const brokerUrl = wsBase ? `${wsBase}?token=${encodeURIComponent(token)}` : `${base.replace(/^http/, 'ws')}/ws?token=${encodeURIComponent(token)}`;
    this.stompClient = new Client({
      brokerURL: brokerUrl,
      reconnectDelay: 5000,
      debug: (msg: string) => console.log('[STOMP]', msg),
    });
    this.stompClient.onConnect = () => {
      console.log('[STOMP] CONNECTED');
      this.connectionStatus$.next(true);
      // Subscribe to all queued topics
      for (const topic of this.queuedTopics) {
        this._subscribeToTopic(topic);
      }
      this.queuedTopics = [];
    };
    this.stompClient.onStompError = (frame: IFrame) => {
      console.error('[STOMP] Broker error:', frame);
      const msg = frame.headers?.['message'] ?? '';
      if (msg.includes('expired')) {
        this.auth.refreshToken().subscribe({
          next: async (freshToken: string) => {
            if (this.stompClient) {
              await this.stompClient.deactivate();
              this.stompClient = null;
            }
            this._connectWithTokenAndSubscribeQueued(freshToken);
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

  private _connectWithTokenAndSubscribe(topic: string, token: string): void {
    // Prefer explicit wsUrl from environment if provided
    const wsBase = (environment as any).wsUrl ? (environment as any).wsUrl.replace(/\/$/, '') : null;
    const base = environment.apiUrl.replace(/\/$/, '');
    const brokerUrl = wsBase ? `${wsBase}?token=${encodeURIComponent(token)}` : `${base.replace(/^http/, 'ws')}/ws?token=${encodeURIComponent(token)}`;
    if (!this.stompClient) {
      this.stompClient = new Client({
        brokerURL: brokerUrl,
        reconnectDelay: 5000,
        debug: (msg: string) => console.log('[STOMP]', msg),
      });

      this.stompClient.onConnect = () => {
        console.log('[STOMP] CONNECTED');
        // Subscribe to all topics in the map
        for (const [t, sub] of this.subscriptions.entries()) {
          if (sub) sub.unsubscribe();
        }
        this.subscriptions.clear();
        // Subscribe to the topic
        this._subscribeToTopic(topic);
      };

      this.stompClient.onStompError = (frame: IFrame) => {
        console.error('[STOMP] Broker error:', frame);
        const msg = frame.headers?.['message'] ?? '';
        if (msg.includes('expired')) {
          this.auth.refreshToken().subscribe({
            next: async (freshToken: string) => {
              if (this.stompClient) {
                await this.stompClient.deactivate();
                this.stompClient = null;
              }
              this._connectWithTokenAndSubscribe(topic, freshToken);
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
    } else {
      // Already connected, just subscribe to topic
      this._subscribeToTopic(topic);
    }
  }

  private _subscribeToTopic(topic: string): void {
    if (!this.stompClient || !this.stompClient.connected) {
        if (!this.queuedTopics.includes(topic)) {
            this.queuedTopics.push(topic);
        }
        return;
    }
    if (this.subscriptions.has(topic)) {
        return;
    }

  const sub = this.stompClient.subscribe(topic, (message: IMessage) => {
    try {
      const parsed = JSON.parse(message.body);
      console.log('[WebsocketService] Received message on', topic, ':', parsed);
            
      // Add topic information
      const messageWithTopic = { ...parsed, _wsTopic: topic };

      // Recognize StartGameBundle
      if (isStartGameBundleMessage(messageWithTopic)) {
        console.log('[WebsocketService] Detected StartGameBundleMessage, pushing to messages$', messageWithTopic);
        this.messages$.next(messageWithTopic);
        return;
      }

      // Accept new start message format: { players, statSelectorId, roomCode, ... }
      const isNewStartMsg = Array.isArray(messageWithTopic.players) && typeof messageWithTopic.statSelectorId === 'string' && typeof messageWithTopic.roomCode === 'string';
      if (isNewStartMsg) {
        console.log('[WebsocketService] Detected new start message format, pushing to messages$', messageWithTopic);
        this.messages$.next(messageWithTopic);
        return;
      }

      // Validate message based on topic type
      const messageType = getMessageTypeFromTopic(topic);
      let isValid = false;
      switch (messageType) {
        case 'start':
          // Accept if isGameStartMessage OR if it has a 'message' property with value 'game started'
          isValid = isGameStartMessage(messageWithTopic) ||
                    (typeof messageWithTopic.message === 'string' && messageWithTopic.message.toLowerCase().includes('game started'));
          break;
        case 'state':
          isValid = isGameStateMessage(messageWithTopic);
          break;
        case 'room':
          isValid = isRoomInfoMessage(messageWithTopic);
          isValid = true; // Accept room messages even if validation fails
          break;
        default:
          isValid = true; // Accept unknown message types
      }
      if (!isValid) {
        console.log('[WebsocketService] Message validation failed for type', messageType);
        console.warn(`[WebsocketService] Invalid ${messageType} message:`, messageWithTopic);
        return;
      }
      // Emit the message
      this.messages$.next(messageWithTopic);
        } catch (e) {
            console.error('[WebsocketService] Failed to parse message:', message.body, e);
        }
    });
    this.subscriptions.set(topic, sub);
  }
  /**
   * Returns an observable for connection status (true = connected)
   */
  getConnectionStatus() {
    return this.connectionStatus$.asObservable();
  }

  /**
   * Returns an observable that emits only messages from the specified topic.
   * Usage: this.ws.filterMessagesByTopic('/topic/rooms/ABC')
   */
  public filterMessagesByTopic<T extends WebSocketMessage>(topic: string) {
    return this.messages$.asObservable().pipe(
      filter((msg): msg is T => {
        if (!msg || msg._wsTopic !== topic) return false;
        const messageType = getMessageTypeFromTopic(topic);
        switch (messageType) {
          case 'start':
            // Accept StartGameBundleMessage, GameStartMessage, or new start message format
            const isNewStartMsg = Array.isArray(msg.players) && typeof msg.statSelectorId === 'string' && typeof msg.roomCode === 'string';
            return isStartGameBundleMessage(msg) || isGameStartMessage(msg) || isNewStartMsg;
          case 'state':
            return isGameStateMessage(msg);
          case 'room':
            return isRoomInfoMessage(msg);
          default:
            return true;
        }
      })
    );
  }

  disconnectTopic(topic: string): void {
    const sub = this.subscriptions.get(topic);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(topic);
    }
    // If no more subscriptions, disconnect stompClient
    if (this.subscriptions.size === 0 && this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }




  send(destination: string, data: any): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({ destination, body: JSON.stringify(data) });
    }
  }


  disconnect(): void {
    for (const [topic, sub] of this.subscriptions.entries()) {
      if (sub) sub.unsubscribe();
    }
    this.subscriptions.clear();
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

