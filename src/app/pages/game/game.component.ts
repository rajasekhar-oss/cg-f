// ...existing imports and decorator...
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
  topCard: any = null;
  selectCard(card: any) {
    // Implement your select logic here
    console.log('Selected card:', card);
    // Example: close modal after selection
    this.selectedCard = null;
    this.showTopCard = false;
  }
  showNextCard() {
    if (this.myCards && this.myCards.length) {
      // You can customize which card is 'next' (e.g., first, random, etc.)
      this.topCard = this.myCards[0];
      this.selectedCard = this.topCard;
      this.showTopCard = true;
    }
  }
  selectedCard: any = null;
  showCardList: boolean = false;
  showTopCard: boolean = false;

  showCardDetails(card: any) {
    this.selectedCard = card;
    // Check if the selected card is the top card
    this.showTopCard = this.topCard && card && card.id === this.topCard.id;
  }
  closeCardDetails() {
    this.selectedCard = null;
    this.showTopCard = false;
  }
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

  showWelcome = true;
  showGoodLuck = false;

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
    console.log('GameComponent initialized');
    console.log('Route params:', this.route.snapshot.params);
    console.log('Room code:', this.roomCode);
    if (this.roomCode) {
      this.fetchRoomInfo(this.roomCode);
    }
    this.fetchMyCards();
  }

  ngOnInit() {
    // Show welcome for 1.5s, then good luck for 1.5s, then hide both
    setTimeout(() => {
      this.showWelcome = false;
      this.showGoodLuck = true;
      setTimeout(() => {
        this.showGoodLuck = false;
      }, 1500);
    }, 1500);
  }

  fetchRoomInfo(roomCode: string) {
    const path = `/rooms/${roomCode}/info`;
    console.log('API GET:', path);
    this.api.get(path).subscribe((info: any) => {
      console.log('Room info response:', info);
      this.roomInfo = info;
      // Set currentUser from joinedPlayers if available
      const userId = localStorage.getItem('userId');
      console.log('Local userId:', userId);
      if (info && info.joinedPlayers && userId) {
        const me = info.joinedPlayers.find((p: any) => p.id == userId);
        console.log('Matched currentUser:', me);
        if (me) this.currentUser = me;
      }
      // Set admin flag if user has admin role
      this.isAdmin = this.currentUser && this.currentUser.role === 'ADMIN';
      console.log('isAdmin:', this.isAdmin);
      console.log('roomInfo:', this.roomInfo);
      console.log('currentUser:', this.currentUser);
    }, err => {
      console.error('Error fetching room info:', err);
    });
  }

  fetchMyCards() {
    const path = '/cards/my';
    console.log('API GET:', path);
    this.api.get(path).subscribe((cards: any) => {
      console.log('Cards response:', cards);
      this.myCards = cards;
    }, err => {
      console.error('Error fetching cards:', err);
    });
  }

  get tablePlayers() {
    // Local player always index 0, others clockwise
    console.log('roomInfo:', this.roomInfo);
    console.log('currentUser:', this.currentUser);
    if (!this.roomInfo || !this.roomInfo.players || !this.currentUser) return [];
    const players = this.roomInfo.players.map((p: any) => ({ ...p, isMe: p.id === this.currentUser.id }));
    const idx = players.findIndex((p: any) => p.isMe);
    if (idx === -1) return players;
    // Local player at index 0, others clockwise
    console.log('tablePlayers:', [
      ...players.slice(idx),
      ...players.slice(0, idx)
    ]);
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

  endGame() {
    // Implement your end game logic here
    console.log('End Game clicked');
    // Example: show a message or call an API
  }

  leaveGame() {
    window.removeEventListener('beforeunload', this.confirmLeave);
    window.removeEventListener('popstate', this.confirmLeave);
    // Implement your leave game logic here
    console.log('Leave Game clicked');
    // Example: navigate away or show a message
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
