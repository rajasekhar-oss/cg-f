// ...existing imports and decorator...
  // ...existing code removed...
  import { Component } from '@angular/core';
  import { ApiService } from '../../services/api.service';
  import { ActivatedRoute } from '@angular/router';
  import { CommonModule } from '@angular/common';
  import { Router } from '@angular/router';
  import { BottomNavComponent } from '../../shared/bottom-nav.component';
  import { WebsocketService } from '../../services/websocket.service';
  import { RoomInfoDto } from '../../models/room-info.model';
  import { GameStateDto, PlayerInfo, RoundInfo } from '../../models/game-state.model';
  import { RoomResponse } from '../../models/room-response.model';
  import { AuthService } from '../../services/auth.service';

  @Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
    imports: [CommonModule]
  })
  export class GameComponent {
    topCard: any = null;
    selectedCard: any = null;
    showCardList: boolean = false;
    showTopCard: boolean = false;
    selectedStat: string | null = null;
  isMyTurn: boolean = false;
  currentStatSelector: string = '';
  currentPlayerName: string = '';
  myUserId: string = '';
  players: PlayerInfo[] = [];
  fullPlayers: any[] = []; // Store full player objects from StartGameBundleDto

  // Always return fullPlayers with local user first
  
  gameState: GameStateDto | null = null;
    gameId: string = '';
    // Strict typing for backend DTOs
  roomInfo: RoomInfoDto | null = null;
    myCards: any[] = [];
    showSpinner: boolean;
    showCards: boolean;
    canLeaveGame: boolean;
    canDeleteGame: boolean;
    messages: any[];
    isAdmin: boolean = false;
    roomCode: string = '';
    showWelcome = true;
    showGoodLuck = false;

    private gameWsSub: any = null;

    constructor(
      private api: ApiService,
      private route: ActivatedRoute,
      private ws: WebsocketService,
      private router: Router,
      private auth: AuthService
    ) {
      // Set myUserId as early as possible using AuthService
      this.myUserId = this.auth.getUserId() || '';
      this.showSpinner = true;
      this.showCards = false;
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
      this.gameId = this.route.snapshot.params['gameId'] || '';
      // Get StartGameBundleDto from router state (from WaitingRoom)
      const nav = this.router.getCurrentNavigation();
      const startGameBundle: any = nav?.extras?.state?.['startGameBundle'] || null;
      if (startGameBundle) {
        console.log('[GameComponent] StartGameBundleDto from router state:', startGameBundle);
        // Extract players, statSelectorId, roomCode, and roomInfo if present
        this.roomCode = startGameBundle.roomCode || this.roomCode;
        this.players = (startGameBundle.players || []).map((p: any) => p.id ? p.id : p); // keep for legacy
        // Arrange so local player is always at index 0
        const allPlayers = startGameBundle.players || [];
        const myIdx = allPlayers.findIndex((p: any) => p.id?.toString() === this.myUserId);
        if (myIdx > -1) {
          this.fullPlayers = [
            ...allPlayers.slice(myIdx),
            ...allPlayers.slice(0, myIdx)
          ];
        } else {
          this.fullPlayers = allPlayers;
        }
        console.log('[GameComponent] fullPlayers from StartGameBundleDto:', this.fullPlayers);
        this.currentStatSelector = startGameBundle.statSelectorId || '';
        console.log('[GameComponent] currentStatSelector from StartGameBundleDto:', this.currentStatSelector);

        this.currentStatSelector = startGameBundle.statSelectorId || '';
        console.log('[GameComponent] currentStatSelector from StartGameBundleDto:', this.currentStatSelector);
        // If roomInfo is present in startGameBundle, use it
        if (startGameBundle.roomInfo) {
          this.roomInfo = startGameBundle.roomInfo;
          console.log('[GameComponent] roomInfo from StartGameBundleDto:', this.roomInfo);
        }
      }
      // Fallback: fetch room info from API only if not present
      if (!this.roomInfo && this.roomCode) {
        this.fetchRoomInfo(this.roomCode);
      }
      this.fetchMyCards();
      console.log('[GameComponent] Loaded roomInfo:', this.roomInfo);
    }
     get arrangedFullPlayers() {
    console.log('[GameComponent] arrangedFullPlayers getter called', {
      fullPlayers: this.fullPlayers,
      myUserId: this.myUserId
    });
    if (!Array.isArray(this.fullPlayers) || !this.fullPlayers.length || !this.myUserId) return this.fullPlayers;
    const idx = this.fullPlayers.findIndex((p: any) => p.id?.toString() === this.myUserId);
    if (idx === -1) return this.fullPlayers;
    console.log('[GameComponent] arrangedFullPlayers:', this.fullPlayers, idx);
    return [
      ...this.fullPlayers.slice(idx),
      ...this.fullPlayers.slice(0, idx)
    ];

  }

    showNextCard() {
      if (this.myCards && this.myCards.length) {
        this.topCard = this.myCards[0];
        this.selectedCard = this.topCard;
        this.showTopCard = true;
        this.selectedStat = null;
      }
    }
// (removed duplicate import block and class definition)

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
  // Stat list for the top card
  // get statList() {
  //   if (!this.topCard) return [];
  //   return [
  //     { key: 'totalFilms', label: 'Total Films', value: this.topCard.totalFilms },
  //     { key: 'yearsActive', label: 'Years Active', value: this.topCard.yearsActive },
  //     { key: 'highestGrossing', label: 'Highest Grossing', value: this.topCard.highestGrossing },
  //     { key: 'awardsWon', label: 'Awards Won', value: this.topCard.awardsWon },
  //     { key: 'followers', label: 'Followers', value: this.topCard.followers },
  //     { key: 'languages', label: 'Languages', value: this.topCard.languages },
  //     { key: 'professions', label: 'Professions', value: this.topCard.professions }
  //   ];
  // }
  // Inside GameComponent
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
    console.log('[GameComponent] Stat selected:', statKey);
  }

  submitStatSelection() {
  this.showTopCard = false; // Close the next card when submitting
  this.selectedCard = null; // Also close the card detail view
   
    console.log('[GameComponent] submitStatSelection called with:', { selectedStat: this.selectedStat, roomCode: this.roomCode });
    if (!this.selectedStat || !this.roomCode) return;
    // Find the stat label for the selected stat key
    const statObj = this.statList.find(stat => stat.key === this.selectedStat);
    const statLabel = statObj ? statObj.label : this.selectedStat;
    console.log('[GameComponent] Submitting stat selection:', { statKey: this.selectedStat, statLabel }, this.roomCode);
    console.log("playerCards being sent:", this.tablePlayers);
    const playerCards = this.tablePlayers.map((player: any) => ({
  userId: player.id,
  cardId: player.topCard?.id || null
}))
console.log('[GameComponent] PlayerCards being sent:', playerCards);
    // Send both statKey and statLabel to backend as per PlayStatRequest
    this.api.post(`/api/rooms/game/${this.roomCode}/play-stat`, { statKey: this.selectedStat, statLabel, playerCards }).subscribe({
      next: (data) => {
        // Log the response data
        console.log('[GameComponent] play-stat API response:', data);
        // Log the previous selectedStat value before resetting
        console.log('[GameComponent] Previous selectedStat sent:', this.selectedStat);
        this.selectedStat = null;
      },
      error: err => {
        console.error('[GameComponent] Error submitting stat selection:', err);
      }
    });
  }

  startGame() {
    if (!this.roomCode) {
      console.error('[GameComponent] No roomCode set');
      return;
    }
    // 1. REST: Start game and get RoomResponse
  this.api.post<RoomResponse>(`/api/rooms/${this.roomCode}/start`, {}).subscribe((roomResponse) => {
      console.log('[GameComponent] RoomResponse:', roomResponse);
      // 2. WebSocket: Subscribe to /topic/rooms/{roomCode}/start for StartGameDto
      const startTopic = `/topic/rooms/${this.roomCode}/start`;
      this.ws.connectAndSubscribe(startTopic);
      // Listen for StartGameDto on this topic
      const startSub = this.ws.messages$.subscribe((msg: any) => {
        // Try to detect StartGameDto shape
        if (msg && msg.gameId && msg.roomCode) {
          console.log('[GameComponent] StartGameDto:', msg);
          // 3. Subscribe to /topic/game/{gameId}/user/{userId} for GameStateDto
          const userId = localStorage.getItem('userId') || this.myUserId;
          if (userId) {
            const gameTopic = `/topic/game/${msg.gameId}/user/${userId}`;
            this.ws.connectAndSubscribe(gameTopic);
          }
          // 4. Subscribe to /topic/rooms/{roomCode} for RoomInfoDto
          const roomInfoTopic = `/topic/rooms/${msg.roomCode}`;
          this.ws.connectAndSubscribe(roomInfoTopic);
          // Unsubscribe from startSub after receiving StartGameDto
          startSub.unsubscribe();
        }
      });
    }, (err) => {
      console.error('[GameComponent] Error starting game:', err);
    });
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

    // Always subscribe to /topic/game/user/{userId} for general GameStateDto updates
    if (this.myUserId) {
      const altGameTopic = `/topic/game/user/${this.myUserId}`;
      this.ws.connectAndSubscribe(altGameTopic);
    }

    // Subscribe to all WebSocket messages and update myCards and currentStatSelector on GameStateDto
    this.ws.messages$.subscribe((msg: any) => {
      if (!msg) return;
      // RoomInfoDto: has roomCode, requiredPlayers, joinedPlayers, joinedPlayersUsernames
      if (
        msg.roomCode &&
        Array.isArray(msg.joinedPlayers) &&
        Array.isArray(msg.joinedPlayersUsernames) &&
        typeof msg.requiredPlayers !== 'undefined'
      ) {
        console.log('[GameComponent] RoomInfoDto:', msg);
      }
      // GameStateDto: has gameId, playerCards, winnerUserId
      if (
        Array.isArray(msg.myCards) &&
        msg.winner
      ) {
        console.log('[GameComponent] GameStateDto:', msg);
        // Update myCards with playerCards for this user
        // const me = msg.myCards.find((c: any) => c.userId?.toString() === this.myUserId);
        // if (me && me.cards) {
        //   this.myCards = me.cards.map((shortCard: any) =>
        //     this.allMyCards.find((fullCard: any) => fullCard.id === shortCard.id) || shortCard
        //   );
        // }
        this.myCards=msg.myCards
        // Set currentStatSelector to winnerUserId
        this.currentStatSelector = msg.winner;
        this.topCard = this.myCards && this.myCards.length ? this.myCards[0] : null;
      }
      // GameStateDto: has gameId, players, deckSizes (legacy)
      if (
        msg.gameId &&
        Array.isArray(msg.players) &&
        typeof msg.deckSizes === 'object'
      ) {
        console.log('[GameComponent] GameStateDto (legacy):', msg);
      }
      // StartGameDto: has gameId and roomCode, but not players/deckSizes
      if (
        msg.gameId &&
        msg.roomCode &&
        !msg.players &&
        !msg.deckSizes
      ) {
        console.log('[GameComponent] StartGameDto:', msg);
      }
    });

    // Log tablePlayers at init
    console.log('[GameComponent] tablePlayers at ngOnInit:', this.tablePlayers);
    // Force evaluation for debugging
    console.log('[GameComponent] arrangedFullPlayers (ngOnInit):', this.arrangedFullPlayers);
  }

  ngOnDestroy() {
    if (this.gameWsSub) {
      this.gameWsSub.unsubscribe();
      this.gameWsSub = null;
    }
    if (this.gameId && this.myUserId) {
      const topic = `/topic/game/${this.gameId}/user/${this.myUserId}`;
      this.ws.disconnectTopic(topic);
    }
  }

  fetchRoomInfo(roomCode: string) {
  const path = `/api/rooms/${roomCode}/info`;
    console.log('API GET:', path);
    this.api.get(path).subscribe((info: any) => {
      console.log('Room info response:', info);
      this.roomInfo = info;
      // Set isAdmin if creatorId matches myUserId
      this.isAdmin = info && info.creatorId && this.myUserId && info.creatorId.toString() === this.myUserId;
      // DO NOT overwrite fullPlayers here; always use StartGameBundleDto data for fullPlayers
      console.log('isAdmin:', this.isAdmin);
      console.log('roomInfo:', this.roomInfo);
      // Log tablePlayers after roomInfo is set
      console.log('[GameComponent] tablePlayers after fetchRoomInfo:', this.tablePlayers);
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
      console.log('All cards stored separately:', this.myCards);
    }, err => {
      console.error('Error fetching cards:', err);
    });
  }

  get tablePlayers() {
    // Prefer fullPlayers (from StartGameBundleDto) if available
    if (Array.isArray(this.fullPlayers) && this.fullPlayers.length && this.myUserId) {
      // Arrange so local player is at index 0, others clockwise
      const idx = this.fullPlayers.findIndex((p: any) => p.id?.toString() === this.myUserId);
      if (idx === -1) {
        console.log('[GameComponent] tablePlayers (no local player):', this.fullPlayers);
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
      console.log('[GameComponent] tablePlayers (arranged, fullPlayers):', arranged);
      arranged.forEach((p, i) => console.log(`[GameComponent] Player #${i}:`, p));
      return arranged;
    }
    // Fallback to roomInfo if fullPlayers not available
    if (!this.roomInfo || !this.roomInfo.joinedPlayers || !this.myUserId) return [];
    const ids = this.roomInfo.joinedPlayers.map((id: any) => id.toString());
    const names = this.roomInfo.joinedPlayersUsernames || [];
    const players = ids.map((id: string, i: number) => ({
      id,
      username: names[i] || id,
      isMe: id === this.myUserId,
      profilePicture: undefined
    }));
    const idx = players.findIndex((p: any) => p.isMe);
    if (idx === -1) {
      console.log('[GameComponent] tablePlayers (no local player):', players);
      return players;
    }
    const arranged = [
      ...players.slice(idx),
      ...players.slice(0, idx)
    ];
    console.log('[GameComponent] tablePlayers (arranged):', arranged);
    arranged.forEach((p, i) => console.log(`[GameComponent] Player #${i}:`, p));
    return arranged;
  }

  getCircularSeatStyle(i: number, total: number) {
    // Local player (index 0) always at bottom center
    // All others distributed evenly clockwise
    const percentRadius = 40; // % of table size
    const angleOffset = Math.PI / 2; // bottom center (CSS Y axis is down)
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

  // (removed duplicate selectStat)

  sendMessage() {
    this.messages.push({ text: 'Hello!', bottom: 10, opacity: 1 });
  }

  sendSticker() {
    this.messages?.push({ text: '🎉', bottom: 10, opacity: 1 });
  }
}
