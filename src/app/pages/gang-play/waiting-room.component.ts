
import { RoomInfoDto } from '../../models/room-info.model';
import { RoomResponse } from '../../models/room-response.model';
import { environment } from '../../../environments/environment';
import { Component, OnDestroy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { WebsocketService } from '../../services/websocket.service';
import { NgZone } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { isStartGameBundleMessage } from '../../models/websocket.types';

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorNotificationComponent],
  styleUrls: ['./waiting-room.component.css'],
  template: `
    <!-- Error Notification -->
    <app-error-notification *ngIf="showErrorNotification" [message]="errorNotificationMessage" (closed)="showErrorNotification = false"></app-error-notification>
    <!-- Custom Confirmation Modal -->
    <div class="custom-modal-overlay" *ngIf="showConfirmModal">
      <div class="custom-modal">
        <div class="custom-modal-title">{{ confirmTitle }}</div>
        <div class="custom-modal-message">{{ confirmMessage }}</div>
        <div class="custom-modal-actions">
          <ng-container *ngIf="(roomInfo?.joinedPlayersUsernames?.length || joinedPlayersUsernames.length) === 2">
            <button class="modal-btn confirm" (click)="confirmAction && confirmAction()">End Room</button>
            <button class="modal-btn cancel" (click)="confirmReject && confirmReject()">Cancel</button>
          </ng-container>
          <ng-container *ngIf="(roomInfo?.joinedPlayersUsernames?.length || joinedPlayersUsernames.length) !== 2">
            <ng-container *ngIf="isCreator; else playerConfirmBtns">
              <button class="modal-btn confirm" (click)="confirmAction && confirmAction()">End Room</button>
              <button class="modal-btn confirm" (click)="confirmReject && confirmReject()">Leave Room</button>
              <button class="modal-btn cancel" (click)="showConfirmModal = false">Cancel</button>
            </ng-container>
            <ng-template #playerConfirmBtns>
              <button class="modal-btn confirm" (click)="confirmAction && confirmAction()">Yes</button>
              <button class="modal-btn cancel" (click)="confirmReject && confirmReject()">No</button>
            </ng-template>
          </ng-container>
        </div>
      </div>
    </div>

    <!-- Room Deleted Modal -->
    <div class="custom-modal-overlay" *ngIf="showRoomDeletedModal">
      <div class="custom-modal">
        <div class="custom-modal-title">Room Deleted</div>
        <div class="custom-modal-message">The room has been deleted. You will be redirected to the home page.</div>
      </div>
    </div>

    <!-- Error Modal -->
    <div class="custom-modal-overlay" *ngIf="showErrorModal">
      <div class="custom-modal">
        <div class="custom-modal-title">Error</div>
        <div class="custom-modal-message">{{ error }}</div>
        <div class="custom-modal-actions">
          <button class="modal-btn confirm" (click)="closeErrorModal()">OK</button>
        </div>
      </div>
    </div>

    <!-- Invite/Search Modal -->
    <div class="custom-modal-overlay" *ngIf="showInviteModal">
      <div class="custom-modal" style="text-align: left;">
        <div class="custom-modal-title" style="text-align: center;">Invite Players</div>
        <!-- Already Played With Section -->
        <div style="margin-bottom: 1em;">
          <div style="font-weight:600; color:var(--blue-1); margin-bottom:0.4em; font-size:0.9em; cursor:pointer; display:flex; align-items:center; justify-content:space-between;" (click)="togglePlayedWithSection()">
            Already Played With
            <span style="font-size:0.8em;">{{ showPlayedWithSection ? '▲' : '▼' }}</span>
          </div>
          <ng-container *ngIf="showPlayedWithSection">
            <div *ngIf="isPlayedWithLoading" class="modal-loading" style="font-size:0.9em; color:var(--text-3);">Loading...</div>
            <div *ngIf="!isPlayedWithLoading && playedWithUsers.length === 0" class="modal-empty" style="font-size:0.85em; color:var(--text-4);">No players found.</div>
            <div *ngIf="!isPlayedWithLoading && playedWithUsers.length > 0" class="invite-list">
              <div class="invite-user" *ngFor="let user of playedWithUsers">
                <img [src]="user.pictureUrl" alt="User Picture" class="invite-user-pic" />
                <span class="invite-user-name">{{ user.userName }}</span>
                <button class="modal-btn confirm invite-btn-text" style="padding:0.4em 0.9em; font-size:0.85em;" (click)="inviteUser(user)">Invite</button>
                <button class="invite-btn-icon invite-btn-icon-only" (click)="inviteUser(user)" title="Invite">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                    <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
                  </svg>
                </button>
              </div>
            </div>
          </ng-container>
        </div>
        <!-- Search New Players Section -->
        <div style="margin-bottom: 1em;">
          <div style="font-weight:600; color:var(--blue-1); margin-bottom:0.4em; font-size:0.9em; cursor:pointer; display:flex; align-items:center; justify-content:space-between;" (click)="toggleSearchNewSection()">
            Search New Players
            <span style="font-size:0.8em;">{{ showSearchNewSection ? '▲' : '▼' }}</span>
          </div>
          <ng-container *ngIf="showSearchNewSection">
            <input type="text" [(ngModel)]="inviteSearch" (input)="filterInviteUsers()" placeholder="Search username..." class="invite-search-bar" />
            <div *ngIf="isInviteLoading" class="modal-loading" style="font-size:0.9em; color:var(--text-3);">Loading...</div>
            <div *ngIf="!isInviteLoading && filteredInviteUsers.length === 0 && inviteSearch.trim()" class="modal-empty" style="font-size:0.85em; color:var(--text-4);">No users found.</div>
            <div *ngIf="!isInviteLoading && filteredInviteUsers.length > 0" class="invite-list">
              <div class="invite-user" *ngFor="let user of filteredInviteUsers">
                <img [src]="user.pictureUrl" alt="User Picture" class="invite-user-pic" />
                <span class="invite-user-name">{{ user.userName }}</span>
                <button class="modal-btn confirm invite-btn-text" style="padding:0.4em 0.9em; font-size:0.85em;" (click)="inviteUser(user)">Invite</button>
                <button class="invite-btn-icon invite-btn-icon-only" (click)="inviteUser(user)" title="Invite">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                    <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
                  </svg>
                </button>
              </div>
            </div>
          </ng-container>
        </div>
        <div class="custom-modal-actions">
          <button class="modal-btn cancel" (click)="showInviteModal = false">Close</button>
        </div>
      </div>
    </div>
    <div class="waiting-room-container">
      <div class="room-info">
        <div class="room-code">Room Code: <span>{{ roomInfo?.roomCode || roomCode }}</span></div>
        <div class="players-status">Required Players: <strong>{{ roomInfo?.requiredPlayers || requiredPlayers }}</strong></div>
        <div class="players-status">Joined Players: <strong>{{ roomInfo?.joinedPlayersUsernames?.length || joinedPlayersUsernames.length }}</strong></div>
      </div>
      <div class="players-list-section">
        <h3>Players Joined</h3>
        <div class="players-list">
          <div class="player-card" *ngFor="let username of roomInfo?.joinedPlayersUsernames || joinedPlayersUsernames">{{ username }}</div>
          <div *ngIf="(roomInfo?.joinedPlayersUsernames?.length || joinedPlayersUsernames.length) === 0" style="color:#888;font-size:1em;padding:12px;">No players joined yet.</div>
        </div>
      </div>
      <div class="game-controls">
        <button class="start-btn" [disabled]="(roomInfo?.joinedPlayersUsernames?.length || joinedPlayersUsernames.length) !== (roomInfo?.requiredPlayers || requiredPlayers)" (click)="startGame()">Start Game</button>
        <button class="action-btn" (click)="openInvite()">Invite/Search</button>
        <button class="action-btn" (click)="goToArrange()">Arrange Cards</button>
        <button class="action-btn" (click)="leaveRoom()">Leave Room</button>
        <button *ngIf="isCreator" class="action-btn" (click)="deleteRoom()">Delete Room</button>
      </div>
    </div>
  `,
})

export class WaitingRoomComponent implements OnInit, OnDestroy {
  showRoomDeletedModal = false;
  roomEnded: boolean = false;

  // Invite/Search modal state
  showInviteModal = false;
  playedWithUsers: Array<{ userName: string; pictureUrl: string }> = [];
  isPlayedWithLoading = false;
  inviteUsers: Array<{ userName: string; pictureUrl: string }> = [];
  filteredInviteUsers: Array<{ userName: string; pictureUrl: string }> = [];
  isInviteLoading = false;
  inviteSearch: string = '';
  // Section collapse states - only one open at a time
  showPlayedWithSection = true;
  showSearchNewSection = false;

  /**
   * Shows the leave/end room modal and returns a Promise that resolves to true if the user confirms, false otherwise.
   * Optionally, pass nextUrl to allow special handling (e.g., skip modal for /game).
   */
  showLeaveOrEndRoomModal(nextUrl?: string): Promise<boolean> {
    // If navigating to game or arrange cards, skip modal
    if (nextUrl && (nextUrl.startsWith('/game') || nextUrl.startsWith('/cards/arrange'))) {
      return Promise.resolve(true);
    }
    return new Promise(resolve => {
      const onlyTwoPlayers = (this.roomInfo?.joinedPlayersUsernames?.length || this.joinedPlayersUsernames.length) === 2;
      if (onlyTwoPlayers || this.isCreator) {
        this.confirmTitle = 'End Room';
        this.confirmMessage = 'Do you want to end the room for all players?';
        this.showConfirmModal = true;
        this.confirmAction = () => {
          this.showConfirmModal = false;
          this.deleteRoomConfirmed(() => resolve(true));
        };
        this.confirmReject = () => {
          this.showConfirmModal = false;
          // If creator and more than 2 players, allow leave as alternative
          // if (!onlyTwoPlayers && this.isCreator) {
          //   this.leaveRoomConfirmed(() => resolve(true));
          // } else {
          //   resolve(false);
          // }
        };
      } else {
        this.confirmTitle = 'Leave Room';
        this.confirmMessage = 'Are you sure you want to leave the room?';
        this.showConfirmModal = true;
        this.confirmAction = () => {
          this.showConfirmModal = false;
          this.leaveRoomConfirmed(() => resolve(true));
        };
        this.confirmReject = () => {
          this.showConfirmModal = false;
          resolve(false);
        };
      }
    });
  }
  private wasGameStartState: boolean = false;
  private wsStartSub: any = null;
  // Removed showOptions, not needed for individual buttons
  error: string = '';
  showErrorModal: boolean = false;
  private errorModalTimeout: any = null;
  isLoading: boolean = false;
  roomInfo: RoomInfoDto | null = null;
  roomResponse: RoomResponse | null = null;
  subscriptions: any[] = [];
  roomCode: string = '';
  requiredPlayers: number = 0;
  joinedPlayersUsernames: string[] = [];
  isCreator: boolean = false;
  currentUserId: string | number | null = null;
  public wsSub: any = null;
  public wsConnSub: any = null;
  showErrorNotification = false;
  errorNotificationMessage = '';
  // Make api, ws, and router public for guard access
  // Make api, ws, and router public for guard access

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public api: ApiService,
    public ws: WebsocketService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
    private auth: AuthService,
    private notification: NotificationService
  ) {
    // Get current user id from JWT with safer parsing and detailed logs
    const token = this.auth.getAccessToken();
    try {
      const payload = this.getJwtPayload(token as any);
      if (payload) {
        // support multiple possible claim names commonly used
        const id = payload.id || payload.userId || payload.sub || payload.user_id || payload.uid;
        if (id) {
          this.currentUserId = id;
        }
      }
    } catch (e) {
      // Error parsing token for user id
    }
  }

  // Helper: parse JWT payload (supports window.decodeJwt if present, otherwise base64-decodes)
  private getJwtPayload(token: string | null | undefined): any {
    if (!token || typeof token !== 'string') return null;
    try {
      if ((window as any).decodeJwt && typeof (window as any).decodeJwt === 'function') {
        return (window as any).decodeJwt(token);
      }
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payloadB64 = parts[1];
      // Add padding if needed
      const pad = payloadB64.length % 4;
      const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/') + (pad ? '='.repeat(4 - pad) : '');
      const decoded = atob(base64);
      try {
        return JSON.parse(decodeURIComponent(escape(decoded)));
      } catch (e) {
        return JSON.parse(decoded);
      }
    } catch (e) {
      return null;
    }
  }

  ngOnInit() {
    this.showErrorModal = false;
    if (this.errorModalTimeout) clearTimeout(this.errorModalTimeout);
    const nav = this.router.getCurrentNavigation();
    let stateRoomInfo: any = nav?.extras?.state?.['roomInfo'];
    this.route.paramMap.subscribe((params: any) => {
      this.roomCode = params.get('roomCode') || '';
      if (stateRoomInfo && 'creatorId' in stateRoomInfo) {
        this.roomInfo = stateRoomInfo as RoomInfoDto;
        this.requiredPlayers = this.roomInfo?.requiredPlayers || 0;
        this.joinedPlayersUsernames = this.roomInfo?.joinedPlayersUsernames || [];
        this.isLoading = false;
        this.isCreator = this.roomInfo.creatorId === this.currentUserId;
      } else if (this.roomCode) {
        // Fetch from backend if not present in state
        const apiPath = `/api/rooms/${this.roomCode}/info`;
        const sub = this.api.get(apiPath).subscribe({
          next: (res: any) => {
            if( res && res.errorMessage) {
              this.showErrorModal = true;
              this.roomEnded = true;
              if (this.errorModalTimeout) clearTimeout(this.errorModalTimeout);
              this.errorModalTimeout = setTimeout(() => {
                this.showErrorModal = false;
              }, 5000);
              this.router.navigateByUrl('/', { replaceUrl: true });
              this.isLoading = false;
              return;
            }
            this.roomInfo = res;
            this.requiredPlayers = res.requiredPlayers;
            this.joinedPlayersUsernames = res.joinedPlayersUsernames || [];
            this.isLoading = false;
            this.isCreator = res.creatorId === this.currentUserId;
            this.error = res.message || '';
          },
          error: (e: any) => {
            this.error = e?.error?.error || e?.error?.message || e?.message || 'Error fetching room info';
            this.showErrorModal = true;
            if (this.errorModalTimeout) clearTimeout(this.errorModalTimeout);
            this.errorModalTimeout = setTimeout(() => {
              this.showErrorModal = false;
            }, 5000);
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
      const startTopics = `/topic/rooms/${this.roomCode}/start`;
      this.ws.connectAndSubscribe(startTopics);

      // Subscribe to room-level topic for room events (e.g., room_deleted)
      const roomTopic = `/topic/rooms/${this.roomCode}`;
      this.ws.connectAndSubscribe(roomTopic);

      this.wsConnSub = this.ws.getConnectionStatus().subscribe((connected: boolean) => {
      });
        this.ws.messages$.subscribe((msg: any) => {
          if (msg.message === "game started" && this.roomCode) {
            // Retry fetching game info up to 5 times, 400ms apart
            const maxAttempts = 5;
            let attempts = 0;
            const tryFetchGame = () => {
              this.api.get(`/api/rooms/${this.roomCode}/state`).subscribe({
                next: (gameInfo: any) => {
                  if (gameInfo && !gameInfo.errorMessage) {
                    this.router.navigate(['/game', this.roomCode], { state: { game: gameInfo } });
                  } else if (++attempts < maxAttempts) {
                    setTimeout(tryFetchGame, 400);
                  } else {
                    this.errorNotificationMessage = 'Game not found. Please try again.';
                    this.showErrorNotification = true;
                  }
                },
                error: (err: any) => {
                  if (++attempts < maxAttempts) {
                    setTimeout(tryFetchGame, 400);
                  } else {
                    this.errorNotificationMessage = 'Error fetching game info. Please try again.';
                    this.showErrorNotification = true;
                  }
                }
              });
            };
            tryFetchGame();
          }
        });

      // Subscribe to WebSocket connection status
      if (this.wsConnSub) this.wsConnSub.unsubscribe && this.wsConnSub.unsubscribe();
      this.wsConnSub = this.ws.getConnectionStatus().subscribe((connected: boolean) => {
      });

      // Subscribe to all WebSocket messages for debugging
      if (this.wsSub) this.wsSub.unsubscribe && this.wsSub.unsubscribe();
      this.wsSub = this.ws.messages$.subscribe((msg: any) => {
        this.ngZone.run(() => {
          if ((msg.Type === 'room_deleted' || msg.type === 'room_deleted' || msg.message === 'deleted')) {
            this.roomEnded = true;
            this.showRoomDeletedModal = true;
            setTimeout(() => {
              this.showRoomDeletedModal = false;
              this.router.navigateByUrl('/', { replaceUrl: true });
            }, 5000);
            return;
          }
          if (msg && 'creatorId' in msg) {
            this.roomInfo = msg as RoomInfoDto;
            this.requiredPlayers = msg.requiredPlayers || this.requiredPlayers;
            this.joinedPlayersUsernames = msg.joinedPlayersUsernames || [];
            this.isCreator = msg.creatorId === this.currentUserId;
          }
          this.cd.detectChanges();
        });
      });
    });
  }
  closeErrorModal() {
    this.showErrorModal = false;
    if (this.errorModalTimeout) clearTimeout(this.errorModalTimeout);
  }

  fetchRoomInfo(roomCode: string) {
  fetch(`${environment.apiUrl}/api/rooms/${roomCode}/info`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch room info');
        return res.json();
      })
      .then((roomInfo: any) => {
        // Only treat as RoomInfoDto if creatorId exists
        if (roomInfo && 'creatorId' in roomInfo) {
          this.roomInfo = roomInfo as RoomInfoDto;
          this.requiredPlayers = roomInfo.requiredPlayers || 0;
          this.joinedPlayersUsernames = roomInfo.joinedPlayersUsernames || [];
          this.isCreator = roomInfo.creatorId === this.currentUserId;
        }
        // Connect to WebSocket for live updates
        this.ws.connectToRoom(roomCode);
        if (this.wsSub) this.wsSub.unsubscribe && this.wsSub.unsubscribe();
        // WebSocket subscription already set up in ngOnInit
        this.cd.detectChanges();
      })
      .catch(err => {
        this.error = 'Failed to fetch room info. Please try again.';
      });
  }

  startGame() {
    // Only trigger the backend to start the game; all players are already subscribed in ngOnInit
    this.api.post(`/api/rooms/${this.roomCode}/start`, {}).subscribe((roomResponse: any) => {
      if (roomResponse && roomResponse.errorMessage) {
        this.notification.show(roomResponse.errorMessage);
        
        return;
      }
    }, (err: any) => {
      const msg = err?.error?.error || err?.message || 'Failed to start game';
      this.notification.show(msg);
      this.error = msg;
    });
  }

  goToArrange() {
    this.router.navigate(['/cards/arrange'], { state: { fromWaitingRoom: true, roomCode: this.roomCode } });
  }

  // Toggle section visibility - only one open at a time
  togglePlayedWithSection() {
    this.showPlayedWithSection = !this.showPlayedWithSection;
    if (this.showPlayedWithSection) {
      this.showSearchNewSection = false;
    }
  }

  toggleSearchNewSection() {
    this.showSearchNewSection = !this.showSearchNewSection;
    if (this.showSearchNewSection) {
      this.showPlayedWithSection = false;
    }
  }

  openInvite() {
    this.showInviteModal = true;
    this.isPlayedWithLoading = true;
    this.isInviteLoading = false;
    this.inviteSearch = '';
    // Reset section visibility - show played with by default
    this.showPlayedWithSection = true;
    this.showSearchNewSection = false;
    // Fetch played-with users first
    const userId = this.currentUserId?.toString().trim();
    this.api.get(`/request/played-with?userId=${userId}`).subscribe({
      next: (users: any) => {
        if (users && (users.errorMessage || users.error)) {
          // this.showerror
          this.notification.show(users.errorMessage || users.error);
          this.error = users.errorMessage || users.error || 'Failed to fetch played-with users.';
          this.showErrorModal = true;
          this.playedWithUsers = [];
          this.isPlayedWithLoading = false;
          return;
        }
        this.playedWithUsers = users || [];
        this.isPlayedWithLoading = false;
      },
      error: (err:any) => {
        this.playedWithUsers = [];
        this.isPlayedWithLoading = false;
      }
    });
    // Clear new user search results
    this.inviteUsers = [];
    this.filteredInviteUsers = [];
  }

  filterInviteUsers() {
    const search = this.inviteSearch.trim();
    if (!search) {
      this.filteredInviteUsers = [];
      return;
    }
    this.isInviteLoading = true;
    // Fetch new users matching search string (not already played with)
    this.api.get(`/request/${encodeURIComponent(search)}`).subscribe({
      next: (users: any) => {
        if (users && users.errorMessage) {
          this.notification.show(users.errorMessage);
          this.inviteUsers = [];
          this.filteredInviteUsers = [];
          this.isInviteLoading = false;
          return;
        }
        // Remove users already in playedWithUsers
        const playedWithNames = new Set(this.playedWithUsers.map(u => u.userName));
        this.inviteUsers = (users || []).filter((u: any) => !playedWithNames.has(u.userName));
        this.filteredInviteUsers = this.inviteUsers;
        this.isInviteLoading = false;
      },
      error: (err: any) => {
        const msg = err?.error?.error || err?.message || 'Failed to fetch users';
        this.notification.show(msg);
        this.inviteUsers = [];
        this.filteredInviteUsers = [];
        this.isInviteLoading = false;
      }
    });
  }

  inviteUser(user: { userName: string; pictureUrl: string }) {
    if (!user || !user.userName || !this.roomCode) return;
    this.isInviteLoading = true;
    this.api.post(`/request/${user.userName}/${this.roomCode}`, {}).subscribe({
      next: (res: any) => {
        this.showInviteModal = false;
        this.isInviteLoading = false;
        if (res && res.errorMessage) {
          this.notification.show(res.errorMessage);
          return;
        }
        if (res && res.message === "Request sent successfully") {
          this.notification.show("Request sent successfully");
        } else if (res && res.message) {
          this.notification.show(res.message);
        } else {
          this.notification.show('Invite request processed.');
        }
      },
      error: (err: any) => {
        this.showInviteModal = false;
        this.isInviteLoading = false;
        const msg = err?.error?.message || err?.message || 'Unknown error';
        this.notification.show(msg);
      }
    });
  }

  showConfirmModal = false;
  confirmMessage = '';
  confirmTitle = '';
  confirmAction: (() => void) | null = null;
  confirmReject: (() => void) | null = null;

  leaveRoom() {
    // Just trigger navigation, guard will handle confirmation
    this.router.navigate(['/']);
  }

  leaveRoomConfirmed(cb?: () => void) {
    this.isLoading = true;
    const path = `/api/rooms/${this.roomCode}/leave`;
    const sub = this.api.post(path, {}).subscribe({
      next: (res: any) => {
        if( res && res.errorMessage) {
          this.notification.show(res.errorMessage);
          this.showErrorModal = true;
          return;
        }
        this.isLoading = false;
        try { this.ws.disconnect(); } catch (e) { /* ignore */ }
        this.roomEnded = true;
        this.router.navigate(['/']);
        if (cb) cb();
      },
      error: (err: any) => {
        this.error = err?.error?.error || err?.message || 'Failed to leave room';
        this.isLoading = false;
        if (cb) cb();
      }
    });
    this.subscriptions.push(sub);
  }
  deleteRoom() {
    // Just trigger navigation, guard will handle confirmation
    this.router.navigate(['/']);
  }

  deleteRoomConfirmed(cb?: () => void) {
    if (!this.roomCode) {
      this.error = 'No room code to delete';
      if (cb) cb();
      return;
    }
    this.isLoading = true;
    const path = `/api/rooms/${this.roomCode}/delete`;
    const sub = this.api.post(path, {}).subscribe({
      next: (res: any) => {
        if( res && res.errorMessage) {
          this.notification.show(res.errorMessage);
          this.showErrorModal = true;
          return;
        }
        this.isLoading = false;
        try { this.ws.disconnect(); } catch (e) { /* ignore */ }
        this.roomEnded = true;
        this.router.navigateByUrl('/', { replaceUrl: true });
        if (cb) cb();
      },
      error: (err: any) => {
        this.error = err?.error?.error || err?.message || 'Failed to delete room';
        this.isLoading = false;
        if (cb) cb();
      }
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    if (this.wsSub) this.wsSub.unsubscribe && this.wsSub.unsubscribe();
    if (this.wsConnSub) this.wsConnSub.unsubscribe && this.wsConnSub.unsubscribe();
    if (this.wsStartSub) this.wsStartSub.unsubscribe && this.wsStartSub.unsubscribe();
    this.ws.disconnect();
    this.subscriptions.forEach(sub => sub.unsubscribe && sub.unsubscribe());
  }
}
