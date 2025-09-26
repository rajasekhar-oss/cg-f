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
        <div class="joined-cards">
          <div class="joined-card" *ngFor="let user of joinedUsernames">
              {{ user }}
            </div>
        </div>
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
    .joined-cards {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 10px;
      justify-content: center;
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
  `]
})
export class JoinRoomComponent {
  roomCode: string = '';
  roomInfo: import('../../models/room-response').RoomResponse | null = null;
  isLoading = false;
  error = '';
  joinedUsernames: string[] = [];

  constructor(private api: ApiService, private router: Router) {}

  joinRoom() {
    this.isLoading = true;
    this.error = '';
    this.joinedUsernames = [];
        this.api.post(`/api/rooms/${this.roomCode}/join`, {}).subscribe({
      next: (res: any) => {
        this.roomInfo = res;
        this.isLoading = false;
        if (res.joinedPlayers && Array.isArray(res.joinedPlayers)) {
          Promise.all(res.joinedPlayers.map((user: any) => {
            const userId = user.id ? user.id : user;
            const url = `/api/rooms/userName/${userId}`;
            return this.api.get(url).toPromise()
              .then((dto: any) => dto.userName)
              .catch(() => 'Unknown');
          })).then((usernames: string[]) => {
            this.joinedUsernames = usernames;
            if (!res.error || res.error === 'successfully joined in to the room' || res.error==="You have already joined") {
              // Pass usernames to waiting room
              this.router.navigate(['/gang-play/waiting'], {
                state: {
                  roomInfo: {
                    ...res,
                    joinedPlayersUsernames: usernames
                  }
                }
              });
            }
          });
        } else if (!res.error || res.error === 'successfully joined in to the room' || res.error==="You have already joined") {
          // Fallback: no joinedPlayers array, just navigate
          this.router.navigate(['/gang-play/waiting'], { state: { roomInfo: res } });
        }
        if(res.error &&  (res.error != 'successfully joined in to the room' || res.error != "You have already joined")){
            this.error = res.error;
        }
      }
  })};
}
