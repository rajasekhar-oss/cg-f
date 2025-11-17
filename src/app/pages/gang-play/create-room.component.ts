import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorNotificationComponent],
  template: `
  <app-error-notification *ngIf="showNotification" [message]="notificationMessage" (closed)="onNotificationClosed()"></app-error-notification>
  <div class="create-room-container">
      <h2>Create Gang Play Room</h2>
      <div class="input-section">
        <label for="numPlayers">Number of People</label>
        <input id="numPlayers" type="number" min="2" [(ngModel)]="numPlayers" placeholder="Enter number of players" />
      </div>

      <button class="generate-btn" [disabled]="!numPlayers || numPlayers < 2 || isLoading" (click)="createGame()">
        {{ isLoading ? 'Creating...' : 'Create Game' }}
      </button>

      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .create-room-container { max-width: 420px; margin: 40px auto; background: var(--bg-1, #fff); border-radius: 16px; box-shadow: none; padding: 32px; text-align: center; border: 1px solid var(--border-1, #e5e7eb); }
    .create-room-container:hover { box-shadow: 0 4px 24px var(--shadow-1, rgba(0,0,0,0.08)); }
    .input-section { margin-bottom: 18px; }
    label { font-weight: 600; color: var(--text-2, #374151); margin-bottom: 8px; display: block; }
    input[type=number] { padding: 10px; border-radius: 8px; border: 1px solid var(--border-1, #d1d5db); font-size: 1.1rem; width: 100%; margin-top: 4px; background: var(--bg-2, #fff); color: var(--text-1, #111827); }
    .generate-btn { margin-top: 12px; padding: 12px 0; font-size: 1.1rem; border-radius: 10px; background: linear-gradient(90deg, var(--blue-3, #8b5cf6) 60%, var(--blue-2, #3b82f6) 100%); color: var(--text-on-primary, #fff); border: none; cursor: pointer; font-weight: 600; letter-spacing: 0.5px; width: 100%; box-shadow: none; transition: box-shadow 0.2s; }
    .generate-btn:hover:not(:disabled) { box-shadow: 0 2px 8px var(--shadow-1, rgba(0,0,0,0.08)); }
    .generate-btn:disabled { background: var(--bg-3, #ccc); color: var(--text-3, #666); cursor: not-allowed; opacity: 0.6; box-shadow: none; }
    .error { color: var(--error, #dc2626); font-weight: 500; margin-top: 12px; }
  `]
})
export class CreateRoomComponent implements OnDestroy {
  showNotification = false;
  notificationMessage = '';
  numPlayers: number = 2;
  isLoading = false;
  error = '';
  roomInfo: any = null;
  private subscriptions: any[] = [];

  constructor(private api: ApiService, private router: Router) {}

  createGame() {
    this.isLoading = true;
    this.error = '';
    const sub = this.api.post('/api/rooms/create', { requiredPlayers: this.numPlayers }).subscribe({
      next: (res: any) => {
        if (res && res.errorMessage) {
          this.showError(res.errorMessage);
          this.isLoading = false;
          return;
        }
        this.roomInfo = res;
        this.isLoading = false;
        const code = res?.roomCode || '';
        // Navigate directly to waiting room, passing roomInfo in state
        this.router.navigate(['/gang-play/waiting', code], { state: { roomInfo: res } });
      },
      error: (e) => {
        if (e?.error?.errorMessage) {
          this.showError(e.error.errorMessage);
        } else {
          this.showError(e?.error?.error || e?.message || 'Error creating game');
        }
        this.isLoading = false;
      }
    });
    this.subscriptions.push(sub);
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
    this.subscriptions.forEach(sub => sub.unsubscribe && sub.unsubscribe());
  }
}
