import { RoomResponse } from '../../models/room-response';
import { environment } from '../../../environments/environment';
import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { NgZone } from '@angular/core';
import { AuthService } from '../../services/auth.service';

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

export class WaitingRoomComponent implements OnDestroy {
  // Removed showOptions, not needed for individual buttons
  error: string = '';
  isLoading: boolean = false;
  roomInfo: RoomResponse | null = null;
  subscriptions: any[] = [];
  roomCode: string = '';
  requiredPlayers: number = 0;
  joinedPlayers: string[] = [];
  joinedPlayersUsernames: string[] = [];
  joinedPlayerIds: string[] = [];
  isCreator: boolean = false;
  currentUserId: string | number | null = null;
  private wsSub: any = null;

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
      if (stateRoomInfo) {
        this.roomInfo = stateRoomInfo as RoomResponse;
        this.requiredPlayers = this.roomInfo?.requiredPlayers || 0;
        this.joinedPlayers = this.roomInfo?.joinedPlayersUsernames || [];
        this.isLoading = false;
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
      if (this.wsSub) this.wsSub.unsubscribe && this.wsSub.unsubscribe();
      this.wsSub = this.ws.messages$.subscribe((update: RoomResponse) => {
        this.ngZone.run(() => {
          if (!update) return;
          if (update.roomCode !== this.roomCode) return;
          this.roomInfo = update;
          this.requiredPlayers = update.requiredPlayers || this.requiredPlayers;
          this.joinedPlayers = update.joinedPlayers || [];
          this.joinedPlayersUsernames = update.joinedPlayersUsernames || [];
          this.isCreator = update.creatorId === this.currentUserId;
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
      .then((roomInfo: RoomResponse) => {
        // Set all DTO fields
        this.roomInfo = roomInfo;
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
        // Connect to WebSocket for live updates
        this.ws.connectToRoom(roomCode);
        if (this.wsSub) this.wsSub.unsubscribe && this.wsSub.unsubscribe();
        this.wsSub = this.ws.messages$.subscribe((update: RoomResponse) => {
          this.ngZone.run(() => {
            console.log('[WaitingRoom] WebSocket update received:', update);
            if (!update) {
              console.error('[WaitingRoom] WebSocket update is null/undefined:', update);
              return;
            }
            if (update.roomCode !== this.roomCode) {
              console.warn('[WaitingRoom] WebSocket update roomCode mismatch:', update.roomCode, this.roomCode);
              return;
            }
            // Log all DTO fields
            console.log('[WaitingRoom] WebSocket DTO fields:', {
              roomCode: update.roomCode,
              requiredPlayers: update.requiredPlayers,
              joinedPlayers: update.joinedPlayers,
              joinedPlayersUsernames: update.joinedPlayersUsernames,
              creatorId: update.creatorId,
              active: update.active
            });
            // Set all DTO fields from update
            this.roomInfo = update;
            this.requiredPlayers = update.requiredPlayers || this.requiredPlayers;
            this.joinedPlayers = update.joinedPlayers || [];
            this.joinedPlayersUsernames = update.joinedPlayersUsernames || [];
            this.isCreator = update.creatorId === this.currentUserId;
            console.log('[WaitingRoom] State updated from WebSocket:', {
              requiredPlayers: this.requiredPlayers,
              joinedPlayers: this.joinedPlayers,
              joinedPlayersUsernames: this.joinedPlayersUsernames,
              creatorId: update.creatorId,
              active: update.active
            });
            this.cd.detectChanges();
          });
        });
        this.cd.detectChanges();
      })
      .catch(err => {
        this.error = 'Failed to fetch room info. Please try again.';
        console.error('[WaitingRoom] Failed to fetch room info:', err);
      });
  }

  startGame() {
    // Call backend to start game, then navigate with gameId
    const token = this.auth.getAccessToken();
    fetch(`${environment.apiUrl}/api/rooms/${this.roomCode}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
      .then(async res => {
        try {
          const text = await res.text();
          if (!text) return null;
          return JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse response JSON:', e);
          return null;
        }
      })
      .then((data: any) => {
        if (data && data.gameId) {
          this.router.navigate(['/game', data.gameId]);
        } else {
          console.warn('No gameId in response:', data);
        }
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
    this.ws.disconnect();
      this.subscriptions.forEach(sub => sub.unsubscribe && sub.unsubscribe());
  }
}
