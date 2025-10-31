import { Component, NgModule } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';
import { RoomInfoDto } from '../../models/room-info.model';
import { GameInfo } from '../../models/gameinfo';
import { GameStateDto, PlayerInfo, RoundInfo } from '../../models/game-state.model';
import { RoomResponse } from '../../models/room-response.model';
import { AuthService } from '../../services/auth.service';

// Sticker animation interface
interface StickerAnim {
  id: number;
  name: string;
  imageUrl: string;
  userName: string;
  key: number;
  message: string;
}

// Sticker animation input (no key)
interface StickerAnimInput {
  id: number;
  name: string;
  imageUrl: string;
  userName: string;
  message: string;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  imports: [CommonModule, FormsModule]
})

export class GameComponent {
  // For sticker recipient filter (radio buttons)
  // component.ts
stickerRecipient: string[] = [];
isAllSelected = true; // ✅ default all selected

toggleAll(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  this.isAllSelected = checked;

  if (checked) {
    // Select all usernames
    this.stickerRecipient = this.tablePlayers.map(p => p.username);
  } else {
    // Deselect everything
    this.stickerRecipient = [];
  }
}

togglePlayer(username: string, event: Event) {
  const checked = (event.target as HTMLInputElement).checked;

  if (checked) {
    this.stickerRecipient.push(username);
  } else {
    this.stickerRecipient = this.stickerRecipient.filter(u => u !== username);
  }

  // If all individual boxes are selected, mark "All" checked again
  if (this.stickerRecipient.length === this.tablePlayers.length) {
    this.isAllSelected = true;
  } else {
    this.isAllSelected = false;
  }
}



// sendSticker(stickerId: string) {
//   console.log('Sending sticker', stickerId, 'to', this.stickerRecipient);
//   // Add your sending logic here
// }


  // ...existing code...

  // For animated stickers
  stickerAnimations: StickerAnim[] = [];
  private stickerAnimKey = 0;

  sendSticker(selectedStickerId: number, message: string) {
    if (!this.roomCode || (!selectedStickerId && !message)) return;
    // Send stickerId as a query param
    console.log('stickerRecipient:', this.stickerRecipient);
    console.log('[Sticker] Sending stickerId:', selectedStickerId, 'to room:', this.roomCode);
    console.log('[Sticker] Message:', this.message);
    this.api.post(`/api/rooms/${this.roomCode}/stickers/send?id=${selectedStickerId}&recipients=${this.stickerRecipient.join(',')}&message=${message}`, null).subscribe({
      next: (res: any) => {
        console.log('[Sticker] Sticker sent successfully:', res, this.message);
        this.message = ''; // Clear message input after sending
      this.selectedStickerId = 0;
      },
      error: (err) => {
        console.error('[Sticker] Failed to send sticker:', err);
      },
       // Clear selected sticker
    });
  }
  stickerSearch: string = '';
  stickers: Array<{id:number, name: string; imageUrl: string }> = [];
  showStickersPanel: boolean = false;
  roomCode: string = '';
  canLeaveGame: boolean = true;
  canDeleteGame: boolean = true;
  showWelcome: boolean = true;
  showGoodLuck: boolean = false;
  isAdmin: boolean = false;
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
  isMyTurn: boolean = false;
  currentStatSelector: string = '';
  myUserId: string = '';
  players: PlayerInfo[] = [];
  fullPlayers: any[] = [];
  gameState: GameStateDto | null = null;
  gameId: string = '';
  myUsername: string = '';
  roomInfo: GameInfo | null = null;
  myCards: any[] = [];
  currentTopCards: { [playerId: string]: any } = {};
  showSpinner: boolean;
  usernames: string[] = [];
  selectedStickerId: number = 0;
  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private ws: WebsocketService,
    private router: Router,
    private auth: AuthService
  ) {
    // Set myUserId as early as possible using AuthService
    this.myUserId = this.auth.getUserId() || '';
    this.api.get('/users/me').subscribe({
      next: (userData: any) => {
        console.log('Fetched user data:', userData);
        this.myUsername = userData.username;
        this.subscribetoSticker();
        console.log('My UserId:', this.myUserId, 'My Username:', this.myUsername);

      }
    });
    console.log('My UserId:', this.myUserId, 'My Username:', this.myUsername);
    this.showSpinner = true;
  this.showCardList = false;
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
      this.fetchGameInfo(this.roomCode);
    }
    this.fetchMyCards();
    console.log('[GameComponent] Loaded roomInfo:', this.roomInfo);
    // Optionally prefetch stickers
    // this.fetchStickers();
  }
  fetchStickers() {
    this.api.get('/api/rooms/stickers').subscribe((stickers: any) => {
      this.stickers = stickers as Array<{ id:number, name: string; imageUrl: string }>;
      this.showStickersPanel = true;
      this.stickerSearch = '';
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

  // Returns the local player's username for 'You' display

  // Group previous round cards by roundnumber and compute summary for each round
  getGroupedRounds() {
    if (!Array.isArray(this.previousRoundCards)) return [];
    const grouped: { [round: number]: any[] } = {};
    this.previousRoundCards.forEach(card => {
      const rn = card.roundnumber;
      if (!grouped[rn]) grouped[rn] = [];
      grouped[rn].push(card);
    });
    // Sort rounds descending (latest first)
    const roundNumbers = Object.keys(grouped).map(Number).sort((a, b) => b - a);
    return roundNumbers.map(rn => ({
      roundnumber: rn,
      cards: grouped[rn],
      ...this.getRoundSummaryFromCards(grouped[rn])
    }));
  }

  // Compute winner/loser/tie summary for a round's cards
  getRoundSummaryFromCards(cards: any[]) {
    if (!cards.length) return { winner: null, winnerCount: 0, losers: [], tiePlayers: [] };
    // Find winner username (all cards have same roundnumber)
    const winner = cards.find(c => c.winner)?.winner || '';
    // Find tiePlayersWinners (if any)
    const tiePlayersWinners = cards[cards.length - 1].tiePlayersWinners || [];
    // Count cards per user
    const userCounts: { [user: string]: number } = {};
    cards.forEach(card => {
      const uname = card.userName || card.username;
      if (!userCounts[uname]) userCounts[uname] = 0;
      userCounts[uname]++;
    });
    if (winner) {
      // There is a winner: show winner +count, all others as losers -count
      const winnerCount = userCounts[winner] || 0;
      const losers = Object.keys(userCounts)
        .filter(u => u !== winner)
        .map(u => ({ userName: u, count: userCounts[u] }));
      return { winner, winnerCount: cards.length - winnerCount, losers, tiePlayers: [] };
    } else if (tiePlayersWinners && tiePlayersWinners.length) {
      // No winner, but tie
      const tiePlayers = tiePlayersWinners.map((u: string) => ({ userName: u, count: userCounts[u] || 0 }));
      const losers = Object.keys(userCounts)
        .filter(u => !tiePlayersWinners.includes(u))
        .map(u => ({ userName: u, count: userCounts[u] }));
      return { winner: null, winnerCount: 0, losers, tiePlayers };
    } else {
      // No winner, no tie (should not happen, fallback)
      const losers = Object.keys(userCounts).map(u => ({ userName: u, count: userCounts[u] }));
      return { winner: null, winnerCount: 0, losers, tiePlayers: [] };
    }
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
  isSelectedStat(card: any, stat: any): boolean {
    if (!card.selectedStat || !stat.label) return false;
    return stat.label.replace(/\s/g, '').toLowerCase() === card.selectedStat.replace(/\s/g, '').toLowerCase();
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
    console.log('[GameComponent] getStatList called for card:', card && (card.id || card.title));
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
    this.stickerRecipient = this.tablePlayers.map(p => p.username);
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
      const stickerTopic = `/topic/game/user/${this.myUsername}/stickers`;
      console.log('[GameComponent] Subscribing to sticker topic for user:', this.myUsername, 'topic:', stickerTopic);
      this.ws.connectAndSubscribe(stickerTopic);
    }
 

    // Subscribe to stickers topic for this room
    // if (this.roomCode) {
    //   console.log('[GameComponent] Subscribing to stickers topic for room:', this.roomCode);
    //   const stickerTopic = `/topic/rooms/${this.roomCode}/stickers`;
    //   this.ws.connectAndSubscribe(stickerTopic);
    //   this.ws..subscribe((msg) => {
    //     console.log('[GameComponent] Received sticker message:', msg);
    //     if (msg && msg.imageUrl && msg.userName) {
    //       console.log('[Sticker] Received StickerDto:', msg);
    //       this.showStickerAnimation(msg);
    //     }
    //   });
    // }

    // On refresh/rejoin, fetch previous round cards from backend
  // Fetch previous round cards for this user/room

    // Subscribe to all WebSocket messages and update myCards and currentStatSelector on GameStateDto
    this.ws.messages$.subscribe((msg: any) => {
      if (!msg) return;
      // RoomInfoDto: has roomCode, requiredPlayers, joinedPlayers, joinedPlayersUsernames
      if (
        msg.roomCode &&
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
        this.showTopCard = false; // Close the next card when submitting
        this.selectedCard = null;
        this.myCards = msg.myCards;

        try {
          if (Array.isArray(msg.myCards)) {
            msg.myCards.forEach((entry: any) => {
              const uid = entry.userId?.toString();
              if (uid) {
                const first = Array.isArray(entry.cards) && entry.cards.length ? entry.cards[0] : (Array.isArray(entry) && entry.length ? entry[0] : null);
                this.currentTopCards[uid] = first || null;
              }
            });
          }
        } catch (e) {
          console.warn('[GameComponent] Failed to populate currentTopCards from myCards shape', e);
        }

        // Set currentStatSelector to winnerUserId
        this.previousRoundCards = msg.currentRoundCards;
        console.log('[GameComponent] previousRoundCards updated:', this.previousRoundCards);
        this.currentStatSelector = msg.currentStatSelector;
        console.log('[GameComponent] currentStatSelector updated:', this.currentStatSelector);
        this.topCard = this.myCards && this.myCards.length ? this.myCards[0] : null;
      }
      // GameStateDto: has gameId, players, deckSizes (legacy)
      if (
        msg.gameId &&
        Array.isArray(msg.players) &&
        typeof msg.deckSizes === 'object'
      ) {
        console.log('[GameComponent] GameStateDto (legacy):', msg);
        // Legacy playerCards shape: msg.playerCards is expected to be an array of { userId, card } or similar
        if (Array.isArray((msg as any).playerCards)) {
          try {
            (msg as any).playerCards.forEach((pc: any) => {
              const uid = pc.userId?.toString();
              if (uid) {
                // If card is nested under 'card' or direct
                const card = pc.card || pc.topCard || pc;
                this.currentTopCards[uid] = card || null;
              }
            });
          } catch (e) {
            console.warn('[GameComponent] Failed to populate currentTopCards from playerCards shape', e);
          }
        }
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
      // Handle StickerDto messages (sticker animation)
      if (msg && typeof msg.id === 'number' && typeof msg.imageUrl === 'string' && typeof msg.userName === 'string') {
        console.log('[Sticker] Received StickerDto via WebSocket:', msg);
        this.showStickerAnimation(msg);
      }
    });

    // Log tablePlayers at init
    console.log('[GameComponent] tablePlayers at ngOnInit:', this.tablePlayers);
    // Force evaluation for debugging
    console.log('[GameComponent] arrangedFullPlayers (ngOnInit):', this.arrangedFullPlayers);
  }
     subscribetoSticker(){
    if(this.myUsername) {
      const stickerTopic = `/topic/game/user/${this.myUsername}/stickers`;
      console.log('[GameComponent] Subscribing to sticker topic for user:', this.myUsername, 'topic:', stickerTopic);
      this.ws.connectAndSubscribe(stickerTopic);
    }
  }
  selectSticker(id: number) {
    this.selectedStickerId = id;
  }

  // Show sticker animation

  showStickerAnimation(sticker: { id: number; name: string; imageUrl: string; userName: string; message: string }) {
    const key = ++this.stickerAnimKey;
    this.stickerAnimations.push({ ...sticker, key });
    setTimeout(() => {
      this.stickerAnimations = this.stickerAnimations.filter(s => s.key !== key);
    }, 22000); // Animation duration (ms)
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

  fetchGameInfo(roomCode: string) {
    const path = `/api/rooms/${roomCode}/state`;
    console.log('API GET:', path);
    this.api.get(path).subscribe((info: any) => {
      console.log('Room info response:', info);
      this.roomInfo = info;
      this.usernames=info.usernames
      this.previousRoundCards =info.currentRoundCards || [];
      this.currentStatSelector = info.currentStatSelector || '';
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
        profilePicture: p.profilePicUrl,
        topCard: this.currentTopCards[p.id?.toString()] || null
      }));
      console.log('[GameComponent] tablePlayers (arranged, fullPlayers):', arranged);
      arranged.forEach((p, i) => console.log(`[GameComponent] Player #${i}:`, p));
      return arranged;
    }
    // Fallback to roomInfo if fullPlayers not available
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
      console.log('[GameComponent] tablePlayers (no local player):', players);
      return players;
    }
    const arranged = [
      ...players.slice(idx),
      ...players.slice(0, idx)
    ];
    const withTop = arranged.map((p: any) => ({ ...p, topCard: this.currentTopCards[p.id?.toString()] || null }));
    console.log('[GameComponent] tablePlayers (arranged):', withTop);
    withTop.forEach((p, i) => console.log(`[GameComponent] Player #${i}:`, p));
    return withTop;
  }

  // Helper for template: get top card object for a given player id (accepts string or number)
  getTopCardForPlayer(id: any) {
    console.log('[GameComponent] getTopCardForPlayer called with id:', id);
    if (!id) {
      console.log('[GameComponent] getTopCardForPlayer returning null because id is falsy');
      return null;
    }
    const key = id?.toString();
    // Prefer currentTopCards populated from GameStateDto
    if (this.currentTopCards) {
      console.log('[GameComponent] getTopCardForPlayer found in currentTopCards:', this.myCards[0]);
      return this.myCards[0];
    }
    // Fallback: if tablePlayers has topCard property
    const p = this.tablePlayers.find((pl: any) => pl.id?.toString() === key);
    const res = this.myCards[0];
    console.log('[GameComponent] getTopCardForPlayer fallback result:', res);
    return res;
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



  togglePreviousRoundCards() {
    // Just toggle visibility. Data will be provided later.
    this.showPreviousRoundCards = !this.showPreviousRoundCards;
  }
  // Returns stat list for previous round card (for detailed prev card view)
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
