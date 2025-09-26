// ...existing code removed...
import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  imports: [CommonModule]
})
export class GameComponent {
  roomInfo: any;
  currentUser: any;
  myCards: any[] = [];
  showSpinner: boolean;
  showCards: boolean;
  isMyTurn: boolean;
  selectedStat: any;
  canLeaveGame: boolean;
  canDeleteGame: boolean;
  messages: any[];
  isAdmin: boolean = false;
  roomCode: string = '';

  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.showSpinner = true;
    this.showCards = false;
    this.isMyTurn = true;
    this.selectedStat = null;
    this.canLeaveGame = true;
    this.canDeleteGame = true;
    this.messages = [
      { text: 'Welcome!', bottom: 10, opacity: 1 },
      { text: 'Good luck!', bottom: 40, opacity: 0.8 }
    ];
    window.addEventListener('beforeunload', this.confirmLeave);
    window.addEventListener('popstate', this.confirmLeave);
    this.roomCode = this.route.snapshot.params['code'] || '';
    if (this.roomCode) {
      this.fetchRoomInfo(this.roomCode);
    }
    this.fetchMyCards();
  }

  fetchRoomInfo(roomCode: string) {
    this.api.get(`/rooms/${roomCode}/info`).subscribe((info: any) => {
      this.roomInfo = info;
      // Set currentUser from joinedPlayers if available
      const userId = localStorage.getItem('userId');
      if (info && info.joinedPlayers && userId) {
        const me = info.joinedPlayers.find((p: any) => p.id == userId);
        if (me) this.currentUser = me;
      }
      // Set admin flag if user has admin role
      this.isAdmin = this.currentUser && this.currentUser.role === 'ADMIN';
    });
  }

  fetchMyCards() {
    this.api.get('/cards/my').subscribe((cards: any) => {
      this.myCards = cards;
    });
  }

  get tablePlayers() {
    // Local player always index 0, others clockwise
    if (!this.roomInfo || !this.roomInfo.players || !this.currentUser) return [];
    const players = this.roomInfo.players.map((p: any) => ({ ...p, isMe: p.id === this.currentUser.id }));
    const idx = players.findIndex((p: any) => p.isMe);
    if (idx === -1) return players;
    // Local player at index 0, others clockwise
    return [
      ...players.slice(idx),
      ...players.slice(0, idx)
    ];
  }

  getCircularSeatStyle(i: number, total: number) {
    // Local player (index 0) always at bottom center
    // All others distributed evenly clockwise
    const percentRadius = 40; // % of table size
    const angleOffset = Math.PI / 2; // bottom center (CSS Y axis is down)
    const angle = angleOffset - (2 * Math.PI * i) / total;
    const xPercent = 50 + percentRadius * Math.cos(angle);
    const yPercent = 50 + percentRadius * Math.sin(angle);
    return {
      left: `${xPercent}%`,
      top: `${yPercent}%`,
      transform: 'translate(-50%, -50%)'
    };
  }

  confirmLeave = (event: any) => {
    event.preventDefault();
    event.returnValue = 'Are you sure you want to leave the game?';
    return 'Are you sure you want to leave the game?';
  }

  leaveGame() {
    window.removeEventListener('beforeunload', this.confirmLeave);
    window.removeEventListener('popstate', this.confirmLeave);
    // ...actual leave logic...
  }

  selectStat(stat: any) {
    this.selectedStat = stat;
  }

  sendMessage() {
    this.messages.push({ text: 'Hello!', bottom: 10, opacity: 1 });
  }

  sendSticker() {
    this.messages?.push({ text: '🎉', bottom: 10, opacity: 1 });
  }
}
