import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-room',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorNotificationComponent],
  template: `
  <app-error-notification *ngIf="showNotification" [message]="notificationMessage" (closed)="onNotificationClosed()"></app-error-notification>
  <div class="join-room-container">
      <h2>Join Game Room</h2>
      <div *ngIf="error" class="error-banner">{{ error }}</div>
      <div class="input-section">
        <label for="roomCode">Enter Room Code</label>
        <input id="roomCode" type="text" [(ngModel)]="roomCode" placeholder="Room code" />
      </div>
      <button  [disabled]="roomCode.length !== 6" class="join-btn" (click)="joinRoom()">Join Room</button>
  `,
  styles: [`
    .join-room-container { max-width: 420px; margin: 40px auto; background: var(--bg-1, #fff); border-radius: 16px; box-shadow: none; padding: 32px; text-align: center; border: 1px solid var(--border-1, #e5e7eb); }
    .join-room-container:hover { box-shadow: 0 4px 24px var(--shadow-1, rgba(0,0,0,0.08)); }
    .input-section { margin-bottom: 18px; }
    label { font-weight: 600; color: var(--text-2, #374151); margin-bottom: 8px; display: block; }
    input[type=text] { padding: 10px; border-radius: 8px; border: 1px solid var(--border-1, #d1d5db); font-size: 1.1rem; width: 100%; margin-top: 4px; background: var(--bg-2, #fff); color: var(--text-1, #111827); }
    .join-btn { margin-top: 12px; padding: 12px 0; font-size: 1.1rem; border-radius: 10px; background: linear-gradient(90deg, var(--blue-3, #8b5cf6) 60%, var(--blue-2, #3b82f6) 100%); color: var(--text-on-primary, #fff); border: none; cursor: pointer; font-weight: 600; letter-spacing: 0.5px; width: 100%; box-shadow: none; transition: box-shadow 0.2s; }
    .join-btn:hover:not(:disabled) { box-shadow: 0 2px 8px var(--shadow-1, rgba(0,0,0,0.08)); }
    .join-btn:disabled { background: var(--bg-3, #ccc); color: var(--text-3, #666); cursor: not-allowed; opacity: 0.6; box-shadow: none; }
    .room-info { margin-top: 24px; background: var(--bg-3, #f3f4f6); border-radius: 8px; padding: 16px; }
    .info-item { font-size: 1.1rem; color: var(--text-1, #1f2937); margin-bottom: 8px; }
    .joined-cards {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 10px;
      justify-content: center;
    }
    .joined-card {
      background: var(--bg-3, #f3f4f6);
      color: var(--text-2, #374151);
      border-radius: 8px;
      padding: 12px 0;
      font-size: 1.08rem;
      font-weight: 500;
      box-shadow: none;
      min-width: 120px;
      max-width: 120px;
      text-align: center;
      letter-spacing: 0.5px;
      transition: box-shadow 0.15s;
      border: 1px solid var(--border-1, #e5e7eb);
      margin-bottom: 2px;
    }
    .joined-card:hover {
      box-shadow: 0 4px 16px var(--shadow-1, rgba(0,0,0,0.08));
      background: var(--bg-2, #e5e7eb);
    }
    .error { color: var(--error, #dc2626); font-weight: 500; margin-top: 12px; }
    .error-banner {
      background: var(--error-bg, #fee2e2);
      color: var(--error-dark, #b91c1c);
      font-weight: 600;
      padding: 12px 0;
      border-radius: 8px;
      margin-bottom: 18px;
      box-shadow: none;
      letter-spacing: 0.5px;
    }
  `]
})
export class JoinRoomComponent implements OnDestroy {
  showNotification = false;
  notificationMessage = '';
  roomCode: string = '';
  roomInfo: any = null;
  isLoading = false;
  error = '';
  joinedUsernames: string[] = [];
  joinedPlayerIds: string[] = [];
  private sub: any = null;

  constructor(private api: ApiService, private router: Router) {}

  joinRoom() {
    this.isLoading = true;
    this.error = '';
    this.joinedUsernames = [];
    this.joinedPlayerIds = [];
    if (this.sub) this.sub.unsubscribe && this.sub.unsubscribe();
    this.sub = this.api.post(`/api/rooms/${this.roomCode}/join`, {}).subscribe({
      next: (res: any) => {
        if (res && res.errorMessage) {
          this.showError(res.errorMessage);
          this.isLoading = false;
          return;
        }
        this.roomInfo = res;
        this.isLoading = false;
        this.joinedUsernames = res.joinedPlayersUsernames || [];
        if (!res.error || res.error === 'successfully joined in to the Game' || res.error === "You have already joined") {
          this.router.navigate(['/gang-play/waiting', this.roomCode], { state: { roomInfo: res } });
        }
        if (res.error && (res.error !== 'successfully joined in to the Game' && res.error !== "You have already joined")) {
          this.error = res.error;
          this.roomCode="";
        }
      },
      error: (e: any) => {
        if (e?.error?.errorMessage) {
          this.showError(e.error.errorMessage);
        } else {
          this.showError('Error joining room');
        }
        this.isLoading = false;
      }
    });
  }
  showError(msg: string) {
    this.notificationMessage = msg;
    this.showNotification = true;
  }

  onNotificationClosed() {
    this.showNotification = false;
    this.notificationMessage = '';
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe && this.sub.unsubscribe();
  }
}
