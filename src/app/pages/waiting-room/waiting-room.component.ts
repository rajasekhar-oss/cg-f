import { Component } from '@angular/core';
import { RoomResponse } from '../../models/room-response';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { BottomNavComponent } from '../../shared/bottom-nav.component';

@Component({
  standalone: true,
  imports: [CommonModule, BottomNavComponent],
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html'
})
export class WaitingRoomComponent {
  code = '';
  roomInfo: any = null;
  joinedPlayersUsernames: string[] = [];
  eventType: string = '';
  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router){
    this.code = route.snapshot.params['code'];
    this.fetchRoomInfo();
    // Optionally poll for updates or use websocket for real-time
  }
  fetchRoomInfo() {
    this.api.get(`/rooms/${this.code}/info`, { responseType: 'json' }).subscribe((info: any) => {
      this.roomInfo = info;
      if (info.joinedPlayersUsernames) {
        this.joinedPlayersUsernames = info.joinedPlayersUsernames;
      }
      if (info.eventType) {
        this.eventType = info.eventType;
      }
    });
  }
  get canStartGame(): boolean {
    return this.roomInfo !== null && Array.isArray(this.roomInfo.joinedPlayers) && this.roomInfo.joinedPlayers.length === this.roomInfo.requiredPlayers;
  }
  // Helper to display usernames in template
  get displayUsernames(): string[] {
    return this.joinedPlayersUsernames && this.joinedPlayersUsernames.length > 0
      ? this.joinedPlayersUsernames
      : (this.roomInfo?.joinedPlayersUsernames || []);
  }
  start() {
    console.log('Starting game for room');
    this.api.post(`/api/rooms/${this.code}/start`, {}).subscribe(() => {
      // Navigate to gang-play waiting room with state
      this.router.navigate(['/gang-play/waiting'], { state: { roomInfo: this.roomInfo } });
    }, (err: any) => {
      // Optionally show notification
    });
  }

  // ...existing bottom nav logic...
}
