import { Component } from '@angular/core';
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
      <div class="input-section">
        <label for="roomCode">Enter Room Code</label>
        <input id="roomCode" type="text" [(ngModel)]="roomCode" placeholder="Room code" />
      </div>
      <button class="join-btn" [disabled]="!roomCode || isLoading" (click)="joinRoom()">Join Room</button>
      <div *ngIf="roomInfo" class="room-info">
        <div class="info-item"><strong>Room Code:</strong> {{ roomInfo.roomCode }}</div>
        <div class="info-item"><strong>Required Players:</strong> {{ roomInfo.requiredPlayers }}</div>
        <div class="info-item"><strong>Joined Players:</strong></div>
        <ul class="joined-list">
          <li *ngFor="let user of roomInfo.joinedPlayers">
            {{ user.name }} <span style="color:#6b7280;font-size:0.95em;">({{ user.id }})</span>
          </li>
        </ul>
      </div>
      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .join-room-container { max-width: 420px; margin: 40px auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 32px; text-align: center; }
    .input-section { margin-bottom: 18px; }
    label { font-weight: 600; color: #374151; margin-bottom: 8px; display: block; }
    input[type=text] { padding: 10px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 1.1rem; width: 100%; margin-top: 4px; }
    .join-btn { margin-top: 12px; padding: 12px 0; font-size: 1.1rem; border-radius: 10px; background: linear-gradient(90deg, #8b5cf6 60%, #3b82f6 100%); color: white; border: none; cursor: pointer; font-weight: 600; letter-spacing: 0.5px; width: 100%; }
    .room-info { margin-top: 24px; background: #f3f4f6; border-radius: 8px; padding: 16px; }
    .info-item { font-size: 1.1rem; color: #1f2937; margin-bottom: 8px; }
    .error { color: #dc2626; font-weight: 500; margin-top: 12px; }
  `]
})
export class JoinRoomComponent {
  roomCode: string = '';
  roomInfo: import('../../models/room-response').RoomResponse | null = null;
  isLoading = false;
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  joinRoom() {
    this.isLoading = true;
    this.error = '';
    this.api.post(`/api/rooms/${this.roomCode}/join`, {}).subscribe({
      next: (res: any) => {
        this.roomInfo = res;
        this.isLoading = false;
        // Log all relevant fields
  console.log('roomCode:', res.roomCode);
  console.log('requiredPlayers:', res.requiredPlayers);
  console.log('joinedPlayers:', res.joinedPlayers);
  console.log('error:', res.error);
        if(res.error){
            this.error = res.error;
        }
      }
  })};
}
