import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { GameInfo } from '../../models/gameinfo';
import { GameStateDto, PlayerInfo } from '../../models/game-state.model';
import { AuthService } from '../../services/auth.service';

interface StickerAnim {
  id: number;
  name: string;
  imageUrl: string;
  userName: string;
  key: number;
  message: string;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  imports: [CommonModule, FormsModule]
})

export class GameComponent {
  @ViewChild('animatedCard', { static: false }) animatedCardRef!: ElementRef;
  showCardAnimation = false;
  animatedCardUrl = '';
  animatedCardStyle: any = {};

  // Call this function to animate a card from one user to another
  animateCardMove(cardImageUrl: string, fromUserIndex: number, toUserIndex: number) {
    const playerSeats = document.querySelectorAll('.player-seat');
    if (!playerSeats[fromUserIndex] || !playerSeats[toUserIndex]) return;
    const sourceRect = (playerSeats[fromUserIndex] as HTMLElement).getBoundingClientRect();
    const targetRect = (playerSeats[toUserIndex] as HTMLElement).getBoundingClientRect();

    // Start at source
    this.animatedCardUrl = cardImageUrl;
    this.animatedCardStyle = {
      position: 'fixed',
      left: sourceRect.left + sourceRect.width / 2 - 40 + 'px',
      top: sourceRect.top + sourceRect.height / 2 - 60 + 'px',
      width: '80px',
      height: '120px',
      transition: 'all 0.7s cubic-bezier(0.4,1,0.6,1)',
      zIndex: 2003
    };
    this.showCardAnimation = true;

    setTimeout(() => {
      // Move to target
      this.animatedCardStyle = {
        ...this.animatedCardStyle,
        left: targetRect.left + targetRect.width / 2 - 40 + 'px',
        top: targetRect.top + targetRect.height / 2 - 60 + 'px'
      };
    }, 50);

    // Hide after animation
    setTimeout(() => {
      this.showCardAnimation = false;
    }, 800);
  }
  private winnerTimeout: any = null;
  isTie: boolean = false;
  stickerRecipient: string[] = [];
  isAllSelected = false;
  stickerAnimations: StickerAnim[] = [];
  private stickerAnimKey = 0;
  myImage: string = "";
  stickerSearch: string = '';
  stickers: Array<{ id: number, name: string; imageUrl: string }> = [];
  showStickersPanel: boolean = false;
  roomCode: string = '';
  canLeaveGame: boolean = true;
  isAdmin: boolean = false;
  subscriptions: any[] = [];
  gameWsSub: any = null;
  message: string = '';
  messages: Array<{ text: string; bottom: number; opacity: number }> = [];
  topCard: any = null;
  selectedCard: any = null;
  showCardList: boolean = false;
  showPreviousRoundCards: boolean = false;
  previousRoundCards: any[] = [];
  showTopCard: boolean = false;
  selectedStat: string | null = null;
  currentStatSelector: string = '';
  myUserId: string = '';
  players: PlayerInfo[] = [];
  fullPlayers: any[] = [];
  myUsername: string = '';
  roomInfo: GameInfo | null = null;
  myCards: any[] = [];
  usernames: string[] = [];
  selectedStickerId: number = 0;
  private storedroomcode: string = "";
  private playerInfo: PlayerInfo | null = null;
  currentroundplayers: string[] = [];
  winner: string = "";
  constructor(
    private api: ApiService,
    private ws: WebsocketService,
    private router: Router,
    private auth: AuthService
  ) {
    const nav = this.router.getCurrentNavigation();
    this.storedroomcode = nav?.extras?.state?.['roomCode'];
    if (this.storedroomcode != null && this.storedroomcode != "" && this.players.length == 0 && this.roomCode == "") {
      this.roomCode = this.storedroomcode;
    }
    if (this.roomCode) {
      this.fetchGameInfo(this.roomCode);
    }
    this.myUserId = this.auth.getUserId() || '';
    if (this.myUserId) {
      this.fetchuserInfo();
      this.fetchMyCards();
      this.fetchStickers();
    }
    this.showCardList = false;
    this.selectedStat = null;
    this.canLeaveGame = true;
  }
  ngOnInit() {
    if (this.myUserId && this.roomCode) {
      this.fetchuserInfo();
      this.fetchGameInfo(this.roomCode);
      this.fetchMyCards();
      this.fetchStickers();
    }
    this.stickerRecipient = this.tablePlayers.map(p => p.username);
    if (this.myUserId) {
      const altGameTopic = `/topic/game/user/${this.myUserId}`;
      this.ws.connectAndSubscribe(altGameTopic);
      const playerInfoTopic = `/topic/gameChange/${this.myUserId}`;
      this.ws.connectAndSubscribe(playerInfoTopic);
      const roomInfoTopic = `/topic/endGame/${this.myUserId}`;
      this.ws.connectAndSubscribe(roomInfoTopic);
    }
    if (this.myUsername) {
      const stickerTopic = `/topic/game/user/${this.myUsername}/stickers`;
      this.ws.connectAndSubscribe(stickerTopic);
    }

    const wsSub = this.ws.messages$.subscribe((msg: any) => {
      if (!msg) return;
      if (msg.currentStatSelector) {
        this.showTopCard = false;
        this.selectedCard = null;
        this.updateGameState(msg);
      }
      if (msg && typeof msg.id === 'number' && typeof msg.imageUrl === 'string' && typeof msg.userName === 'string') {
        this.showStickerAnimation(msg);
      }
      if (msg.type === 'playerinfo changed') {
        if (this.roomCode) {
          this.fetchGameInfo(this.roomCode);
        }
      }
      if (msg.type === 'Gameended') {
        this.router.navigate(['/']);
        alert('The game has ended. You are being redirected to the home page.');
      }
    });
    this.subscriptions.push(wsSub);
  }
  updateGameState(msg: any) {
    this.players = msg.players;
    this.myCards = msg.myCards;
    this.currentroundplayers = msg.currentRoundPlays;
    this.previousRoundCards = msg.currentRoundCards;
    if (this.winnerTimeout) {
      clearTimeout(this.winnerTimeout);
      this.winnerTimeout = null;
    }
    if (!msg.tie) {
      this.winner = msg.winner;
      this.isTie = false;
      this.winnerTimeout = setTimeout(() => {
        this.winner = '';
      }, 5000);
    } else if (msg.tie) {
      this.isTie = true;
      this.winner = '';
      this.winnerTimeout = setTimeout(() => {
        this.isTie = false;
      }, 5000);
    }

    this.currentStatSelector = msg.currentStatSelector;
    this.topCard = this.myCards && this.myCards.length ? this.myCards[0] : null;
  }
  fetchuserInfo() {
    this.api.get('/users/me').subscribe({
      next: (userData: any) => {
        this.myUsername = userData.username;
        this.myImage = userData.imageUrl;
      }
    });
  }
  showNextCard() {
    if (this.myCards && this.myCards.length) {
      this.topCard = this.myCards[0];
      this.selectedCard = this.topCard;
      this.showTopCard = true;
      this.selectedStat = null;
    }
  }
  isSelectedStat(card: any, stat: any): boolean {
    if (!card.selectedStat || !stat.label) return false;
    return stat.label.replace(/\s/g, '').toLowerCase() === card.selectedStat.replace(/\s/g, '').toLowerCase();
  }

  showCardDetails(card: any) {
    this.selectedCard = card;
    this.showTopCard = this.topCard && card && card.id === this.topCard.id;
    this.selectedStat = null;
  }
  closeCardDetails() {
    this.selectedCard = null;
    this.showTopCard = false;
    this.selectedStat = null;
  }
  get statList() {
    if (!this.topCard) return [];
    return [
      { key: 'totalFilms', label: 'Total Films', value: this.topCard.totalFilms },
      { key: 'yearsActive', label: 'Years Active', value: this.topCard.yearsActive },
      { key: 'highestGrossing', label: 'Highest Grossing', value: this.topCard.highestGrossing },
      { key: 'awardsWon', label: 'Awards Won', value: this.topCard.awardsWon },
      { key: 'followers', label: 'Followers', value: this.topCard.followers },
      { key: 'languages', label: 'Languages', value: this.topCard.languages },
      { key: 'professions', label: 'Professions', value: this.topCard.professions }
    ];
  }

  getStatList(card: any) {
    if (!card) return [];
    return [
      { key: 'totalFilms', label: 'Total Films', value: card.totalFilms },
      { key: 'yearsActive', label: 'Years Active', value: card.yearsActive },
      { key: 'highestGrossing', label: 'Highest Grossing', value: card.highestGrossing },
      { key: 'awardsWon', label: 'Awards Won', value: card.awardsWon },
      { key: 'followers', label: 'Followers', value: card.followers },
      { key: 'languages', label: 'Languages', value: card.languages },
      { key: 'professions', label: 'Professions', value: card.professions }
    ];
  }
  selectStat(statKey: string) {
    this.selectedStat = statKey;
  }
  submitStatSelection() {
    this.showTopCard = false;
    this.selectedCard = null;
    if (!this.selectedStat || !this.roomCode) return;
    const statObj = this.statList.find(stat => stat.key === this.selectedStat);
    const statLabel = statObj ? statObj.label : this.selectedStat;
    const playerCards = this.tablePlayers.map((player: any) => ({
      userId: player.id,
      cardId: player.topCard?.id || null
    }))
    this.api.post(`/api/rooms/game/${this.roomCode}/play-stat`, { statKey: this.selectedStat, statLabel, playerCards }).subscribe({
      next: (data) => {
        this.selectedStat = null;
      },
      error: err => {
        console.error('[GameComponent] Error submitting stat selection:', err);
      }
    });
  }
  get arrangedFullPlayers() {
    if (!Array.isArray(this.fullPlayers) || !this.fullPlayers.length || !this.myUserId) return this.fullPlayers;
    const idx = this.fullPlayers.findIndex((p: any) => p.id?.toString() === this.myUserId);
    if (idx === -1) return this.fullPlayers;
    return [
      ...this.fullPlayers.slice(idx),
      ...this.fullPlayers.slice(0, idx)
    ];

  }
  getGroupedRounds() {
    if (!Array.isArray(this.previousRoundCards)) return [];
    const grouped: { [round: number]: any[] } = {};
    this.previousRoundCards.forEach(card => {
      const rn = card.roundnumber;
      if (!grouped[rn]) grouped[rn] = [];
      grouped[rn].push(card);
    });
    const roundNumbers = Object.keys(grouped).map(Number).sort((a, b) => b - a);
    return roundNumbers.map(rn => ({
      roundnumber: rn,
      cards: grouped[rn],
      ...this.getRoundSummaryFromCards(grouped[rn])
    }));
  }
  getRoundSummaryFromCards(cards: any[]) {
    if (!cards.length) return { winner: null, winnerCount: 0, losers: [], tiePlayers: [] };
    const winner = cards.find(c => c.winner)?.winner || '';
    const tiePlayersWinners = cards[cards.length - 1].tiePlayersWinners || [];
    const userCounts: { [user: string]: number } = {};
    cards.forEach(card => {
      const uname = card.userName || card.username;
      if (!userCounts[uname]) userCounts[uname] = 0;
      userCounts[uname]++;
    });
    if (winner) {
      const winnerCount = userCounts[winner] || 0;
      const losers = Object.keys(userCounts)
        .filter(u => u !== winner)
        .map(u => ({ userName: u, count: userCounts[u] }));
      return { winner, winnerCount: cards.length - winnerCount, losers, tiePlayers: [] };
    } else if (tiePlayersWinners && tiePlayersWinners.length) {
      const tiePlayers = tiePlayersWinners.map((u: string) => ({ userName: u, count: userCounts[u] || 0 }));
      const losers = Object.keys(userCounts)
        .filter(u => !tiePlayersWinners.includes(u))
        .map(u => ({ userName: u, count: userCounts[u] }));
      return { winner: null, winnerCount: 0, losers, tiePlayers };
    } else {
      const losers = Object.keys(userCounts).map(u => ({ userName: u, count: userCounts[u] }));
      return { winner: null, winnerCount: 0, losers, tiePlayers: [] };
    }
  }
  fetchStickers() {
    this.api.get('/api/rooms/stickers').subscribe((stickers: any) => {
      this.stickers = stickers as Array<{ id: number, name: string; imageUrl: string }>;
    }, err => {
      console.error('Error fetching stickers:', err);
    });
  }
  get filteredStickers() {
    if (!this.stickerSearch.trim()) return this.stickers;
    const search = this.stickerSearch.trim().toLowerCase();
    return this.stickers.filter(s => s.name.toLowerCase().includes(search));
  }
  closeStickersPanel() {
    this.showStickersPanel = false;
  }
  selectSticker(id: number) {
    this.selectedStickerId = id;
  }
  toggleAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.isAllSelected = checked;
    this.stickerRecipient = checked ? [...this.usernames] : [];
  }
  togglePlayer(username: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked && !this.stickerRecipient.includes(username)) {
      this.stickerRecipient.push(username);
    } else if (!checked) {
      this.stickerRecipient = this.stickerRecipient.filter(u => u !== username);
    }
    this.isAllSelected = this.stickerRecipient.length === this.usernames.length;
  }

  sendSticker(selectedStickerId: number, message: string) {
    if (!this.roomCode || (!selectedStickerId && !message)) return;
    this.api.post(`/api/rooms/${this.roomCode}/stickers/send?id=${selectedStickerId}&recipients=${this.stickerRecipient.join(',')}&message=${message}`, null).subscribe({
      next: (res: any) => {
        this.message = '';
        this.selectedStickerId = 0;
      },
      error: (err) => {
        console.error('[Sticker] Failed to send sticker:', err);
      },
    });
  }

  showStickerAnimation(sticker: { id: number; name: string; imageUrl: string; userName: string; message: string }) {
    const key = ++this.stickerAnimKey;
    this.stickerAnimations.push({ ...sticker, key });
    setTimeout(() => {
      this.stickerAnimations = this.stickerAnimations.filter(s => s.key !== key);
    }, 22000);
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
    });
    this.subscriptions = [];
    if (this.gameWsSub) {
      this.gameWsSub.unsubscribe();
      this.gameWsSub = null;
    }
  }

  fetchGameInfo(roomCode: string) {
    const path = `/api/rooms/${roomCode}/state`;
    this.api.get(path).subscribe((info: any) => {
      this.usernames = Array.isArray(info.usernames)
        ? info.usernames.filter((uname: string) => uname !== this.myUsername)
        : [];
      this.previousRoundCards = info.currentRoundCards || [];
      this.currentStatSelector = info.currentStatSelector || '';
      this.players = info.players;
      this.currentroundplayers = info.activePlayers;
      if (info.playerInfo != this.playerInfo) {
        this.playerInfo = info.playerInfo
        const allPlayers = info.playerInfo;
        const myIdx = allPlayers.findIndex((p: any) => p.id?.toString() === this.myUserId);
        if (myIdx > -1) {
          this.fullPlayers = [
            ...allPlayers.slice(myIdx),
            ...allPlayers.slice(0, myIdx)
          ];
        } else {
          this.fullPlayers = allPlayers;
        }
      }
      this.isAdmin = info && info.creatorId && this.myUserId && info.creatorId.toString() === this.myUserId;
    }, err => {
      console.error('Error fetching room info:', err);
    });
  }

  fetchMyCards() {
    const path = '/cards/my';
    this.api.get(path).subscribe((cards: any) => {
      this.myCards = cards;
    }, err => {
      console.error('Error fetching cards:', err);
    });
  }
  displayStickers() {
    if (this.stickers) {
      this.showStickersPanel = true;
    }
    else {
      this.fetchStickers();
      this.showStickersPanel = true;
    }
  }

  get tablePlayers() {
    if (Array.isArray(this.fullPlayers) && this.fullPlayers.length && this.myUserId) {
      const idx = this.fullPlayers.findIndex((p: any) => p.id?.toString() === this.myUserId);
      if (idx === -1) {
        return this.fullPlayers.map((p: any) => ({
          ...p,
          isMe: false,
          profilePicture: p.profilePicUrl
        }));
      }
      const arranged = [
        ...this.fullPlayers.slice(idx),
        ...this.fullPlayers.slice(0, idx)
      ].map((p: any) => ({
        ...p,
        isMe: p.id?.toString() === this.myUserId,
        profilePicture: p.profilePicUrl
      }));
      return arranged;
    }
    if (!this.roomInfo || !this.roomInfo.players || !this.myUserId) return [];
    const ids = this.roomInfo.players.map((id: any) => id.toString());
    const names = this.roomInfo.playersUsernames || [];
    const players = ids.map((id: string, i: number) => ({
      id,
      username: names[i] || id,
      isMe: id === this.myUserId,
      profilePicture: undefined
    }));
    const idx = players.findIndex((p: any) => p.isMe);
    if (idx === -1) {
      return players;
    }
    const arranged = [
      ...players.slice(idx),
      ...players.slice(0, idx)
    ];
    return arranged;
  }


  getCircularSeatStyle(i: number, total: number) {
    const percentRadius = 40;
    const angleOffset = Math.PI / 2;
    const angle = angleOffset - (2 * Math.PI * i) / total;
    const xPercent = 50 + percentRadius * Math.cos(angle);
    const yPercent = 50 + percentRadius * Math.sin(angle);
    const style = {
      left: `${xPercent}%`,
      top: `${yPercent}%`,
      transform: 'translate(-50%, -50%)'
    };
    return style;
  }
  confirmLeave = (event: any) => {
    event.preventDefault();
    event.returnValue = 'Are you sure you want to leave the game?';
    return 'Are you sure you want to leave the game?';
  }

  endGame() {
    if (!this.roomCode) {
      console.error('[GameComponent] No roomCode set for endGame');
      return;
    }
    this.api.post(`/api/rooms/${this.roomCode}/end-game`, {}).subscribe({
      next: (res: any) => {
        console.log('[GameComponent] Ended game successfully:', res);

        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('[GameComponent] Failed to end game:', err);
      }
    });
  }

  leaveGame() {
    if (!this.roomCode) {
      console.error('[GameComponent] No roomCode set for leaveGame');
      return;
    }
    this.api.post(`/api/rooms/${this.roomCode}/leave-game`, {}).subscribe({
      next: (res: any) => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('[GameComponent] Failed to leave game:', err);
      }
    });
  }
  togglePreviousRoundCards() {
    this.showPreviousRoundCards = !this.showPreviousRoundCards;
  }
  getPrevCardStats(card: any) {
    if (!card) return [];
    return [
      { label: 'Total Films', value: card.totalFilms },
      { label: 'Years Active', value: card.yearsActive },
      { label: 'Highest Grossing', value: card.highestGrossing },
      { label: 'Awards Won', value: card.awardsWon },
      { label: 'Followers', value: card.followers },
      { label: 'Languages', value: card.languages },
      { label: 'Professions', value: card.professions }
    ];
  }
}
