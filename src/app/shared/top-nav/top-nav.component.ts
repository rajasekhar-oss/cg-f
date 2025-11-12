import { Router } from '@angular/router';

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameRequestService, GameRequest } from '../../services/game-request.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {
  @Input() topNavItems: any[] = [];
  @Input() isActiveRoute!: (route: string) => boolean;
  @Input() navigate!: (route: string) => void;

  requests: GameRequest[] = [];
  showDropdown = false;

  private sub: any = null;
  constructor(
    private gameRequestService: GameRequestService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.gameRequestService.requests$.subscribe(requests => {
      this.requests = requests;
    });
    this.gameRequestService.fetchRequests();
  }

  get requestCount() {
    return this.requests.length;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  joinGame(request: GameRequest) {
    // Join the game room using the roomCode from the request
    if (this.sub) this.sub.unsubscribe && this.sub.unsubscribe();
    this.sub = this.api.post(`/api/rooms/${request.roomCode}/join`, {}).subscribe({
      next: (res: any) => {
        if (res && res.errorMessage) {
          // Optionally show error in UI
          alert(res.errorMessage);
          return;
        }
        // Navigate to waiting room on success
        this.router.navigate(['/gang-play/waiting', request.roomCode], { state: { roomInfo: res } });
      },
      error: (e: any) => {
        alert("Joining game failed: " + (e?.error?.errorMessage || 'Error joining game'));
      }
    });
  }
}
