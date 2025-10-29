import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
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
    .join-room-container { max-width: 420px; margin: 40px auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 32px; text-align: center; }
    .input-section { margin-bottom: 18px; }
    label { font-weight: 600; color: #374151; margin-bottom: 8px; display: block; }
    input[type=text] { padding: 10px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1.1rem; width: 100%; margin-top: 4px; }
    .join-btn { margin-top: 12px; padding: 12px 0; font-size: 1.1rem; border-radius: 10px; background: linear-gradient(90deg, #8b5cf6 60%, #3b82f6 100%); color: white; border: none; cursor: pointer; font-weight: 600; letter-spacing: 0.5px; width: 100%; }
    .room-info { margin-top: 24px; background: #f3f4f6; border-radius: 8px; padding: 16px; }
    .info-item { font-size: 1.1rem; color: #1f2937; margin-bottom: 8px; }
    .joined-cards {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 10px;
      justify-content: center;
    }
      .join-btn:disabled {
  background-color: #ccc;   /* dull gray */
  color: #666;              /* text muted */
  cursor: not-allowed;      /* show the “nah” cursor */
  opacity: 0.6;             /* make it look sleepy */
  box-shadow: none;         /* remove glow or shadow if any */
}

    .joined-card {
      background: #f3f4f6;
      color: #374151;
      border-radius: 8px;
      padding: 12px 0;
      font-size: 1.08rem;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      min-width: 120px;
      max-width: 120px;
      text-align: center;
      letter-spacing: 0.5px;
      transition: box-shadow 0.15s;
      border: 1px solid #e5e7eb;
      margin-bottom: 2px;
    }
    .joined-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      background: #e5e7eb;
    }
    .error { color: #dc2626; font-weight: 500; margin-top: 12px; }
    .error-banner {
      background: #fee2e2;
      color: #b91c1c;
      font-weight: 600;
      padding: 12px 0;
      border-radius: 8px;
      margin-bottom: 18px;
      box-shadow: 0 2px 8px rgba(220,38,38,0.08);
      letter-spacing: 0.5px;
    }
  `]
})
export class JoinRoomComponent implements OnDestroy {
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
        this.roomInfo = res;
        this.isLoading = false;
        this.joinedUsernames = res.joinedPlayersUsernames || [];
        if (!res.error || res.error === 'successfully joined in to the room' || res.error === "You have already joined") {
          this.router.navigate(['/gang-play/waiting', this.roomCode], { state: { roomInfo: res } });
        }
        if (res.error && (res.error !== 'successfully joined in to the room' && res.error !== "You have already joined")) {
          this.error = res.error;
          this.roomCode="";
        }
      },
      error: (e: any) => {
        this.error = 'Error joining room';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe && this.sub.unsubscribe();
  }
}
