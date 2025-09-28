import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="create-room-container">
      <h2>Create Gang Play Room</h2>
      <div class="input-section">
        <label for="numPlayers">Number of People</label>
        <input id="numPlayers" type="number" min="2" [(ngModel)]="numPlayers" placeholder="Enter number of players" />
      </div>
      <button class="generate-btn" [disabled]="!numPlayers || numPlayers < 2 || isLoading" (click)="generateCode()">Generate Code</button>
      <div *ngIf="roomCode" class="code-section">
        <div class="code-box">{{ roomCode }}</div>
        <button class="copy-btn" (click)="copyCode()">Copy Code</button>
        <div class="action-btns">
          <button class="start-btn" (click)="startGame()">Start Game</button>
          <button class="enter-btn" (click)="enterRoom()">Enter Room</button>
        </div>
      </div>
      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .create-room-container { max-width: 420px; margin: 40px auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 32px; text-align: center; }
    .input-section { margin-bottom: 18px; }
    label { font-weight: 600; color: #374151; margin-bottom: 8px; display: block; }
    input[type=number] { padding: 10px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1.1rem; width: 100%; margin-top: 4px; }
    .generate-btn { margin-top: 12px; padding: 12px 0; font-size: 1.1rem; border-radius: 10px; background: linear-gradient(90deg, #8b5cf6 60%, #3b82f6 100%); color: white; border: none; cursor: pointer; font-weight: 600; letter-spacing: 0.5px; width: 100%; }
    .code-section { margin-top: 24px; }
    .code-box { font-size: 2rem; font-weight: 700; background: #f3f4f6; border-radius: 8px; padding: 16px 0; margin-bottom: 12px; letter-spacing: 2px; }
    .copy-btn { background: #e0e7ff; color: #3730a3; border: none; border-radius: 8px; padding: 8px 18px; font-size: 1rem; font-weight: 600; cursor: pointer; margin-bottom: 16px; }
    .action-btns { display: flex; gap: 16px; justify-content: center; margin-top: 8px; }
    .start-btn, .enter-btn { padding: 10px 24px; border-radius: 8px; font-size: 1rem; font-weight: 600; border: none; cursor: pointer; }
    .start-btn { background: #4ade80; color: #065f46; }
    .enter-btn { background: #fbbf24; color: #92400e; }
    .error { color: #dc2626; font-weight: 500; margin-top: 12px; }
  `]
})
export class CreateRoomComponent implements OnDestroy {
  numPlayers: number = 2;
  roomCode: string = '';
  isLoading = false;
  error = '';
  roomInfo: any = null;
  private subscriptions: any[] = [];

  constructor(private api: ApiService, private router: Router) {}

  generateCode() {
    this.isLoading = true;
    this.error = '';
    const sub = this.api.post('/api/rooms/create', { requiredPlayers: this.numPlayers }).subscribe({
      next: (res: any) => {
        this.roomInfo = res;
        this.roomCode = res.roomCode;
        this.isLoading = false;
        // Do NOT navigate immediately; let user choose to enter/start
      },
      error: (e) => {
        this.error = e?.error?.error || e?.message || 'Error generating code';
        this.isLoading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  copyCode() {
    if (this.roomCode) {
      navigator.clipboard.writeText(this.roomCode);
    }
  }

  startGame() {
    if (!this.roomInfo) return;
    this.isLoading = true;
    // Call backend to start game, get gameId and updated room info
    const sub = this.api.post(`/api/rooms/${this.roomCode}/start`, {}).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        // Pass roomCode in URL and state for robust navigation
        this.router.navigate(['/gang-play/waiting', this.roomCode], {
          state: { roomInfo: res }
        });
      },
      error: (e) => {
        this.error = e?.error?.error || e?.message || 'Error starting game';
        this.isLoading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  enterRoom() {
    if (!this.roomInfo) return;
    // Pass roomCode in URL and state for robust navigation
    this.router.navigate(['/gang-play/waiting', this.roomCode], {
      state: { roomInfo: this.roomInfo }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe && sub.unsubscribe());
  }
}
