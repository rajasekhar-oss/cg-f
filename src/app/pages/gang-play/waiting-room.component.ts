import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="waiting-room-container">
      <div class="room-info">
        <div class="room-code">Room Code: <span>{{ roomCode }}</span></div>
        <div class="players-status">Players: {{ requiredPlayers }} / {{ joinedPlayers.length }}</div>
      </div>
      <div class="players-list-section">
        <h3>Players Joined</h3>
        <div class="players-list">
          <div class="player-card" *ngFor="let player of joinedPlayers">{{ player }}</div>
        </div>
      </div>
      <div class="game-controls">
        <button class="start-btn" [disabled]="joinedPlayers.length < requiredPlayers" (click)="startGame()">Start Game</button>
        <button class="arrange-btn" (click)="goToArrange()">Rearrange Cards</button>
        <button class="invite-btn" (click)="openInvite()">Send Request</button>
        <button class="leave-btn" (click)="leaveRoom()">Leave Game</button>
        <button *ngIf="isCreator" class="delete-btn" (click)="deleteRoom()">Delete Game</button>
      </div>
    </div>
  `,
  styles: [`
    .waiting-room-container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 32px; text-align: center; }
    .room-info { margin-bottom: 18px; }
    .room-code { font-size: 1.2rem; font-weight: 600; margin-bottom: 6px; }
    .players-status { font-size: 1.08rem; color: #374151; margin-bottom: 12px; }
    .players-list-section { margin-bottom: 18px; }
    .players-list { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
    .player-card { background: #f3f4f6; color: #374151; border-radius: 8px; padding: 10px 0; font-size: 1.05rem; font-weight: 500; min-width: 110px; max-width: 110px; text-align: center; border: 1px solid #e5e7eb; }
    .game-controls { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; }
    .start-btn { background: #22c55e; color: white; font-weight: 600; border-radius: 8px; padding: 12px 0; border: none; font-size: 1.08rem; cursor: pointer; }
    .start-btn:disabled { background: #a7f3d0; color: #374151; cursor: not-allowed; }
    .arrange-btn, .invite-btn, .leave-btn, .delete-btn { background: #f3f4f6; color: #374151; border-radius: 8px; padding: 10px 0; border: 1px solid #e5e7eb; font-size: 1.05rem; font-weight: 500; cursor: pointer; }
    .delete-btn { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
  `]
})
export class WaitingRoomComponent {
  // ...existing properties...

  start() {
    this.startGame();
  }
  roomCode = '';
  requiredPlayers = 0;
  joinedPlayers: string[] = [];
  isCreator = false;

  constructor(private router: Router) {
    const nav = (this.router.getCurrentNavigation() as any);
    const state = nav?.extras?.state?.roomInfo;
    if (state) {
      this.roomCode = state.roomCode;
      this.requiredPlayers = state.requiredPlayers;
      this.joinedPlayers = state.joinedPlayersUsernames || [];
      this.isCreator = state.isCreator || false;
    }
  }

  startGame() {
  console.log('Start Game button clicked');
  // TODO: Implement start game logic
  this.router.navigate(['/game', this.roomCode]);
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
}
