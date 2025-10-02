import { RoomInfoDto } from '../../models/room-info.model';
import { RoomResponse } from '../../models/room-response.model';
import { environment } from '../../../environments/environment';
import { Component, OnDestroy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { NgZone } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { isStartGameBundleMessage } from '../../models/websocket.types';

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./waiting-room.component.css'],
  template: `
    <div class="waiting-room-container">
      <div class="room-info">
        <div class="room-code">Room Code: <span>{{ roomInfo?.roomCode || roomCode }}</span></div>
        <div class="players-status">Required Players: <strong>{{ roomInfo?.requiredPlayers || requiredPlayers }}</strong></div>
        <div class="players-status">Joined Players: <strong>{{ roomInfo?.joinedPlayers?.length || joinedPlayers.length }}</strong></div>
      </div>
      <div class="players-list-section">
        <h3>Players Joined</h3>
        <div class="players-list">
          <div class="player-card" *ngFor="let username of roomInfo?.joinedPlayersUsernames || joinedPlayers">{{ username }}</div>
          <div *ngIf="(roomInfo?.joinedPlayersUsernames?.length || joinedPlayers.length) === 0" style="color:#888;font-size:1em;padding:12px;">No players joined yet.</div>
        </div>
      </div>
      <div class="game-controls">
        <button class="start-btn" [disabled]="(roomInfo?.joinedPlayers?.length || joinedPlayers.length) !== (roomInfo?.requiredPlayers || requiredPlayers)" (click)="startGame()">Start Game</button>
        <button class="action-btn" (click)="openInvite()">Invite/Search</button>
        <button class="action-btn" (click)="goToArrange()">Arrange Cards</button>
        <button class="action-btn" (click)="leaveRoom()">Leave Room</button>
        <button class="action-btn" (click)="deleteRoom()">Delete Room</button>
      </div>
    </div>
  `,
})

export class WaitingRoomComponent implements OnInit, OnDestroy {
  private wasGameStartState: boolean = false;
  private wsStartSub: any = null;
  // Removed showOptions, not needed for individual buttons
  error: string = '';
  isLoading: boolean = false;
  roomInfo: RoomInfoDto | null = null;
  roomResponse: RoomResponse | null = null;
  subscriptions: any[] = [];
  roomCode: string = '';
  requiredPlayers: number = 0;
  joinedPlayers: string[] = [];
  joinedPlayersUsernames: string[] = [];
  joinedPlayerIds: string[] = [];
  isCreator: boolean = false;
  currentUserId: string | number | null = null;
  private wsSub: any = null;
  private wsConnSub: any = null;

    constructor(
      private router: Router,
      private route: ActivatedRoute,
      private api: ApiService,
      private ws: WebsocketService,
      private cd: ChangeDetectorRef,
      private ngZone: NgZone,
      private auth: AuthService
    ) {
      // Get current user id from JWT
      const token = this.auth.getAccessToken();
      const payload = token ? ((window as any).decodeJwt ? (window as any).decodeJwt(token) : null) : null;
      if (payload && (payload.id || payload.userId)) {
        this.currentUserId = payload.id || payload.userId;
      }
    }

  ngOnInit() {
    console.log('[WaitingRoom] ngOnInit called');
    const nav = this.router.getCurrentNavigation();
    let stateRoomInfo: any = nav?.extras?.state?.['roomInfo'];
    this.route.paramMap.subscribe((params: any) => {
      this.roomCode = params.get('roomCode') || '';
      if (stateRoomInfo && 'creatorId' in stateRoomInfo) {
        this.roomInfo = stateRoomInfo as RoomInfoDto;
        this.requiredPlayers = this.roomInfo?.requiredPlayers || 0;
        this.joinedPlayers = this.roomInfo?.joinedPlayersUsernames || [];
        this.isLoading = false;
        // Always keep latest RoomInfoDto for navigation
        console.log('[WaitingRoom] Loaded roomInfo from router state:', this.roomInfo);
      } else if (this.roomCode) {
        // Fetch from backend if not present in state
        const apiPath = `/api/rooms/${this.roomCode}/info`;
        const sub = this.api.get(apiPath).subscribe({
          next: (res: any) => {
            this.roomInfo = res;
            this.requiredPlayers = res.requiredPlayers;
            this.joinedPlayers = res.joinedPlayersUsernames || [];
            this.isLoading = false;
          },
          error: (e: any) => {
            this.error = e?.error?.error || e?.message || 'Error fetching room info';
            this.isLoading = false;
          }
        });
        this.subscriptions.push(sub);
      } else {
        this.error = 'No room code found in URL.';
        this.isLoading = false;
      }

      // Always connect to WebSocket for live updates
      this.ws.connectToRoom(this.roomCode);

      // Subscribe to /start topic for all players
      const startTopic = `/topic/rooms/${this.roomCode}/start`;
      this.ws.connectAndSubscribe(startTopic);
      if (this.wsStartSub) this.wsStartSub.unsubscribe && this.wsStartSub.unsubscribe();
      this.wsStartSub = this.ws.filterMessagesByTopic(startTopic).subscribe((msg: any) => {
        console.log('[WaitingRoom] StartGameBundleDto or new start message:', msg);
        // Route to game for all players with the received message (old or new format)
        if (Array.isArray(msg.players) && typeof msg.statSelectorId === 'string' && typeof msg.roomCode === 'string') {
          // New format
          this.router.navigate(['/game', this.roomCode], {
            state: {
              startGameBundle: msg
            }
          });
        } else if (msg && msg.gameState && msg.roomInfo && msg.startGame) {
          // Old StartGameBundleDto format
          this.router.navigate(['/game', this.roomCode], {
            state: {
              startGameBundle: msg
            }
          });
        }
      });

      // Subscribe to WebSocket connection status
      if (this.wsConnSub) this.wsConnSub.unsubscribe && this.wsConnSub.unsubscribe();
      this.wsConnSub = this.ws.getConnectionStatus().subscribe((connected: boolean) => {
        console.log('[WaitingRoom] WebSocket connection status:', connected);
      });

      // Subscribe to all WebSocket messages for debugging
      if (this.wsSub) this.wsSub.unsubscribe && this.wsSub.unsubscribe();
      this.wsSub = this.ws.messages$.subscribe((msg: any) => {
        console.log('[WaitingRoom] WebSocket message received:', msg);
        this.ngZone.run(() => {
          if (msg && 'creatorId' in msg) {
            this.roomInfo = msg as RoomInfoDto;
            this.requiredPlayers = msg.requiredPlayers || this.requiredPlayers;
            this.joinedPlayers = msg.joinedPlayers || [];
            this.joinedPlayersUsernames = msg.joinedPlayersUsernames || [];
            this.isCreator = msg.creatorId === this.currentUserId;
            console.log('[WaitingRoom] Updated roomInfo from WebSocket:', this.roomInfo);
          }
          this.cd.detectChanges();
        });
      });
    });
  }

  fetchRoomInfo(roomCode: string) {
    console.log('[WaitingRoom] Fetching room info for:', roomCode);
  fetch(`${environment.apiUrl}/api/rooms/${roomCode}/info`)
      .then(res => {
        console.log('[WaitingRoom] API response status:', res.status);
        if (!res.ok) throw new Error('Failed to fetch room info');
        return res.json();
      })
      .then((roomInfo: any) => {
        // Only treat as RoomInfoDto if creatorId exists
        if (roomInfo && 'creatorId' in roomInfo) {
          this.roomInfo = roomInfo as RoomInfoDto;
          this.requiredPlayers = roomInfo.requiredPlayers || 0;
          this.joinedPlayers = roomInfo.joinedPlayers || [];
          this.joinedPlayersUsernames = roomInfo.joinedPlayersUsernames || [];
          this.isCreator = roomInfo.creatorId === this.currentUserId;
          console.log('[WaitingRoom] Initial state set:', {
            requiredPlayers: this.requiredPlayers,
            joinedPlayers: this.joinedPlayers,
            joinedPlayersUsernames: this.joinedPlayersUsernames,
            creatorId: roomInfo.creatorId,
            active: roomInfo.active
          });
        } else {
          console.warn('[WaitingRoom] API response missing creatorId, ignoring:', roomInfo);
        }
        // Connect to WebSocket for live updates
        this.ws.connectToRoom(roomCode);
        if (this.wsSub) this.wsSub.unsubscribe && this.wsSub.unsubscribe();
        // WebSocket subscription already set up in ngOnInit
        this.cd.detectChanges();
      })
      .catch(err => {
        this.error = 'Failed to fetch room info. Please try again.';
        console.error('[WaitingRoom] Failed to fetch room info:', err);
      });
  }

  startGame() {
    // Only trigger the backend to start the game; all players are already subscribed in ngOnInit
    this.api.post(`/api/rooms/${this.roomCode}/start`, {}).subscribe((roomResponse: any) => {
      console.log('[WaitingRoom] RoomResponse:', roomResponse);
    }, (err: any) => {
      this.error = err?.error?.error || err?.message || 'Failed to start game';
      console.error('[WaitingRoom] Failed to start game:', err);
    });
  }

  goToArrange() {
    this.router.navigate(['/cards/arrange'], { state: { fromWaitingRoom: true, roomCode: this.roomCode } });
  }

  openInvite() {
    // TODO: Implement invite/search logic
  }

  leaveRoom() {
    // TODO: Implement leave room logic
  }

  deleteRoom() {
    // TODO: Implement delete room logic
  }

  ngOnDestroy() {
    if (this.wsSub) this.wsSub.unsubscribe && this.wsSub.unsubscribe();
    if (this.wsConnSub) this.wsConnSub.unsubscribe && this.wsConnSub.unsubscribe();
    if (this.wsStartSub) this.wsStartSub.unsubscribe && this.wsStartSub.unsubscribe();
    this.ws.disconnect();
    this.subscriptions.forEach(sub => sub.unsubscribe && sub.unsubscribe());
  }
}
