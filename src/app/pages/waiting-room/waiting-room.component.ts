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
  roomInfo: RoomResponse | null = null;
  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router){
    this.code = route.snapshot.params['code'];
    this.fetchRoomInfo();
    // Optionally poll for updates or use websocket for real-time
  }
  fetchRoomInfo() {
    this.api.get(`/rooms/${this.code}/info`, { responseType: 'json' }).subscribe((info) => {
      this.roomInfo = info as unknown as RoomResponse;
    });
  }
  get canStartGame(): boolean {
    return this.roomInfo !== null && this.roomInfo.joinedPlayers.length === this.roomInfo.requiredPlayers;
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
