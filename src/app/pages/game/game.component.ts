import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ErrorNotificationComponent } from '../../shared/error-notification.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { GameInfo } from '../../models/gameinfo';
import { GameStateDto, PlayerInfo } from '../../models/game-state.model';
import { AuthService } from '../../services/auth.service';


// Chat message interface (move above @Component)
interface GameMessage {
  id: number;
  roomCode: string;
  message: string;
  senderUsername: string;
  stickerUrl?: string;
  toUsers: string[];
}

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
  imports: [CommonModule, FormsModule, ErrorNotificationComponent]
})

export class GameComponent {
    @ViewChild('chatEnd') chatEnd!: ElementRef;
    ngAfterViewChecked() {
      this.scrollChatToBottom();
    }

    scrollChatToBottom() {
      try {
        if (this.chatEnd) {
          this.chatEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (err) {}
    }
  // Chat state
  showChatPanel = false;
  chatMessages: GameMessage[] = [];
  chatInput: string = '';
  showStickerPicker = false;
  selectedChatSticker: { id: number, name: string, imageUrl: string } | null = null;
  unreadChatCount = 0;
      // Winner stat notification
      showWinnerStatNotification = false;
      winnerStatLabel: string = '';
      winnerStatValue: any = '';
      winnerStatProfilePic: string = '';
      winnerStatUsername: string = '';
      winnerStatCardImageUrl: string = '';
      tieStatPlayers: Array<{ username: string; profilePic: string; cardImage: string }> = [];
    // Winner card animation variables
    winnerCardAnimations: { id: number; x: number; y: number; toX: number; toY: number; imageUrl: string }[] = [];
    cardTransferImage = "https://res.cloudinary.com/dkb442je2/image/upload/v1758714792/twfuswc6gss4grr3tfhl.png"; // Default fallback image
    private animKey = 0;
    // Get seat center position for animation
    getSeatCenter(username: string): { x: number; y: number } | null {
      const seats = document.querySelectorAll('.player-seat');
      for (let i = 0; i < this.arrangedFullPlayers.length; i++) {
        if (this.arrangedFullPlayers[i].username === username) {
          const rect = (seats[i] as HTMLElement).getBoundingClientRect();
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
        }
      }
      return null;
    }

    // Create card animation items from loser to winner, using actual card images
    createCardsFromLoser(loser: string, count: number, winner: string, cardImages: string[]) {
      const from = this.getSeatCenter(loser);
      const to = this.getSeatCenter(winner);
      if (!from || !to) return;
      for (let i = 0; i < count; i++) {
        const id = ++this.animKey;
        const delay = count > 1 ? i * 250 : 0;
        const imageUrl = cardImages[i] || this.cardTransferImage;
        this.winnerCardAnimations.push({
          id,
          x: from.x,
          y: from.y,
          toX: to.x,
          toY: to.y,
          imageUrl
        });
        setTimeout(() => {
          const card = this.winnerCardAnimations.find(c => c.id === id);
          if (card) {
            card.x = card.toX;
            card.y = card.toY;
          }
        }, 100+delay);
        setTimeout(() => {
          this.winnerCardAnimations = this.winnerCardAnimations.filter(c => c.id !== id);
        }, 3000+delay);
      }
    }

    // Animate round winner card transfer using actual card images
    animateRoundWinner() {
      const rounds = this.getGroupedRounds();
      if (!rounds.length) return;
      const latest = rounds[0]; // most recent round
      if (!latest.winner || !latest.losers) return;
      const winnerName = latest.winner;
      // For each loser, collect their cards for this round
      latest.losers.forEach(l => {
        // Find all cards for this loser in the round
        const loserCards = latest.cards.filter((c: any) => (c.userName || c.username) === l.userName);
        // Get their images
        const cardImages = loserCards.map((c: any) => c.picture || c.imageUrl || this.cardTransferImage);
        // If count > actual images, fill with fallback
        while (cardImages.length < l.count) cardImages.push(this.cardTransferImage);
        this.createCardsFromLoser(l.userName, l.count, winnerName, cardImages);
      });
      // Also show winner stat notification if available in latest round summary
      if (latest.statLabel && latest.statValue !== undefined) {
        this.triggerWinnerStatNotification(latest.statLabel, latest.statValue);
      }
    }
  showNotification = false;
  notificationMessage = '';
  // Returns the username of the winner, or undefined if not found
  get winnerUsername(): string | undefined {
    if (!this.winner || !this.arrangedFullPlayers) return undefined;
    const winnerPlayer = this.arrangedFullPlayers.find(p => p.id === this.winner || p.username === this.winner);
    return winnerPlayer?.username;
  }

  // Unified handler for leave/end game top-controls buttons
  onLeaveOrEndGameClick(type: 'leave' | 'end') {
    if (type === 'end') {
      this.requestLeaveConfirmation(
        'Are you sure you want to end the game for all players?',
        'End Game',
        () => this.onEndGameFromModal(),
        () => { } // No-op on cancel
      );
    } else {
      this.requestLeaveConfirmation(
        'Are you sure you want to leave the game?',
        'Leave Game',
        () => this.onLeaveGameFromModal(),
        () => { } // No-op on cancel
      );
    }
  }
  gameEnded = false;
  // Modal state for custom confirmation
  showConfirmModal = false;
  confirmMessage = '';
  confirmTitle = '';
  confirmAction: (() => void) | null = null;
  confirmReject: (() => void) | null = null;
  pendingNavigation: (() => void) | null = null;
  showGameEndedModal = false;


  // Called by guard to trigger modal
  requestLeaveConfirmation(message: string, title: string, onConfirm: () => void, onCancel: () => void) {
    const onlyTwoPlayers = this.arrangedFullPlayers && this.arrangedFullPlayers.length === 2;

    // If only two players, force "End Game" message for everyone
    if (onlyTwoPlayers) {
      message = 'There are only two players in the game. Leaving will end the game for both. Do you want to end the game?';
      title = 'End Game';
    }
    this.confirmMessage = message;
    this.confirmTitle = title;
    this.showConfirmModal = true;
    if (this.isAdmin) {
      // For creator, store both actions
      this.confirmAction = () => {
        this.showConfirmModal = false;
        onConfirm(); // Default to leaveGame if needed
      };
      this.confirmReject = () => {
        this.showConfirmModal = false;
        onCancel();
      };
      // End/Leave handled by separate modal buttons
    } else {
      this.confirmAction = () => {
        this.showConfirmModal = false;
        onConfirm();
      };
      this.confirmReject = () => {
        this.showConfirmModal = false;
        onCancel();
      };
    }
  }

  // For creator: End Game from modal
  onEndGameFromModal() {
    this.showConfirmModal = false;
    this.showGameEndedModal = false;
    this.gameEnded = true;
    this.endGame();
    this.router.navigate(['/']);
  }
  // For creator: Leave Game from modal
  onLeaveGameFromModal() {
    this.showConfirmModal = false;
    this.showGameEndedModal = false;
    this.gameEnded = true;
    this.leaveGame();
    this.router.navigate(['/']);
  }

  onConfirmLeave() {
    this.showGameEndedModal = false;
    this.showConfirmModal = false;
    if (this.confirmAction) this.confirmAction();
  }
  onCancelLeave() {
    this.showGameEndedModal = false;
    this.showConfirmModal = false;
    if (this.confirmReject) this.confirmReject();
  }

  // Game ended modal logic
  onAcknowledgeGameEnded() {
    this.showGameEndedModal = false;
    this.router.navigate(['/']);
  }
  // Listen for browser/tab close or reload
  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent) {
    if (!this.canLeaveGame) return;
    // If only 2 players, always ask to end game
    const onlyTwoPlayers = this.arrangedFullPlayers && this.arrangedFullPlayers.length === 2;
    let message = '';
    if (onlyTwoPlayers) {
      message = 'Do you want to end the game?';
    } else {
      const isCreator = this.isAdmin;
      message = isCreator ? 'Do you want to end the game?' : 'Do you want to leave the game?';
    }
    event.preventDefault();
    event.returnValue = message;
    return message;
  }

  // For mobile PWA/webview: listen for visibility change (optional, best effort)
  @HostListener('document:visibilitychange', [])
  onVisibilityChange() {
    if (document.visibilityState === 'hidden' && this.canLeaveGame) {
      // Optionally, show a dialog or handle as needed
      // This is a best-effort for mobile webviews
    }
  }
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
  showErrorModal = false;
  errorModalMessage = '';
  onAcknowledgeError() {
    this.showErrorModal = false;
    this.router.navigate(['/']);
  }
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
    private auth: AuthService,
    private route: ActivatedRoute
  ) {
    // Restore original logic: prefer router state if present, else use route param
    const nav = this.router.getCurrentNavigation();
    this.storedroomcode = nav?.extras?.state?.['roomCode'];
    const gameMsg = nav?.extras?.state?.['game'];
    // If coming from waiting room or other, only assign if players.length == 0 and roomCode is empty
    if (this.storedroomcode != null && this.storedroomcode !== "" && this.players.length == 0 && this.roomCode == "") {
      this.roomCode = this.storedroomcode;
    } else {
      // Fallback to route param
      const code = this.route.snapshot.paramMap.get('id');
      if (code && this.roomCode === "") {
        this.roomCode = code;
        if (gameMsg) {
          // Update all relevant details from gameMsg
          this.players = gameMsg.players || [];
          this.previousRoundCards = gameMsg.currentRoundCards || [];
          this.currentStatSelector = gameMsg.currentStatSelector || '';
          this.fullPlayers = gameMsg.playerInfo || [];
          this.roomInfo = gameMsg.roomInfo || null;
          this.topCard = gameMsg.topCard || null;
          this.myCards = gameMsg.myCards || [];
          this.currentroundplayers = gameMsg.activePlayers || [];
          this.isAdmin = gameMsg.creatorId && this.myUserId && gameMsg.creatorId.toString() === this.myUserId;
          // Add more assignments as needed for your game state
        }
      }
    }
    if (this.roomCode) {
      this.fetchGameInfo(this.roomCode);
      this.fetchChatMessages();
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
    this.stickerRecipient = this.tablePlayers.map(p => p.username);
    if (this.myUserId) {
      const altGameTopic = `/topic/game/user/${this.myUserId}`;
      this.ws.connectAndSubscribe(altGameTopic);
      const playerInfoTopic = `/topic/gameChange/${this.myUserId}`;
      this.ws.connectAndSubscribe(playerInfoTopic);
      const roomInfoTopic = `/topic/endGame/${this.myUserId}`;
      this.ws.connectAndSubscribe(roomInfoTopic);
    }
    // Removed gottheusername from ngOnInit. It will be a class method and called after username is set.
    const wsSub = this.ws.messages$.subscribe((msg: any) => {
      if (!msg) return;
      if (msg.currentStatSelector) {
        this.showTopCard = false;
        this.selectedCard = null;
        this.updateGameState(msg);
      }
      if (msg && typeof msg.id === 'number' && typeof msg.imageUrl === 'string' && typeof msg.userName === 'string') {
        this.showStickerAnimation(msg);
        this.fetchChatMessages(); // Refresh chat messages when a new sticker/message is received
      }
      if (msg.type === 'playerinfo changed') {
        if (this.roomCode) {
          this.fetchGameInfo(this.roomCode);
        }
      }
      if (msg.type === 'Gameended') {
        this.gameEnded = true;
        // Always close any open confirmation modal
        this.showConfirmModal = false;
        this.showGameEndedModal = true;
        setTimeout(() => {
          if (this.showGameEndedModal) {
            this.showGameEndedModal = false;
            this.showConfirmModal = false;
            this.router.navigate(['/']);
          }
        }, 3000); // 3 seconds
      }
    });
    this.subscriptions.push(wsSub);
    // Fetch chat messages on init if not already loaded
    if (this.roomCode && this.chatMessages.length === 0) {
      this.fetchChatMessages();
    }
  }

  // Toggle chat panel and reset unread count
  toggleChatPanel() {
    this.showChatPanel = !this.showChatPanel;
    if (this.showChatPanel) {
      this.unreadChatCount = 0;
      setTimeout(() => this.scrollChatToBottom(), 100);
    }
    this.showStickerPicker = false;
    this.selectedChatSticker = null;
  }

  // Fetch chat messages from backend
  fetchChatMessages() {
    if (!this.roomCode) return;
    this.api.get(`/api/rooms/${this.roomCode}/messages`).subscribe((messages: any) => {
      if (Array.isArray(messages)) {
        this.chatMessages = messages as GameMessage[];
        setTimeout(() => this.scrollChatToBottom(), 100);
      }
    });
  }

  // Send chat message or sticker
  sendChatMessage() {
    if (!this.roomCode || (!this.chatInput && !this.selectedChatSticker)) return;
    this.api.post(`/api/rooms/${this.roomCode}/stickers/send?id=${this.selectedChatSticker?.id || ''}&recipients=${this.usernames.join(',')}&message=${this.chatInput || ''}`, null)
      .subscribe(() => {
        this.chatInput = '';
        this.selectedChatSticker = null;
        this.showStickerPicker = false;
        this.fetchChatMessages();
      });
  }

  // Select sticker for chat
  selectChatSticker(sticker: { id: number, name: string, imageUrl: string }) {
    this.selectedChatSticker = sticker;
    this.showStickerPicker = false;
  }

  // Utility: get avatar for username
  getUserAvatar(username: string): string {
    const player = this.arrangedFullPlayers.find(p => p.username === username);
    return player?.profilePicUrl || `https://ui-avatars.com/api/?name=${username}&background=random`;
  }

  // ...existing code...

  // Optionally: Listen for new messages via WebSocket and update unread count
  // (This can be improved to use a dedicated chat topic if available)
  // For now, refetch on panel open/send
    triggerTieStatNotification(msg: any, label: string, value: any) {
    this.tieStatPlayers = [];
     
    // Use msg.tiePlayers if present, else fallback to msg.currentRoundPlays
    const tieUsernames = Array.isArray(msg.tiePlayers) ? msg.tiePlayers : (Array.isArray(msg.currentRoundPlays) ? msg.currentRoundPlays : []);
    let statLabel = '';
    let statValue: any = '';
    const cards = msg.currentRoundCards;

    // Mapping from stat key to full label with emoji
    const statKeyToLabel: { [key: string]: string } = {
      'totalFilms': '🎬Total Films',
      'yearsActive': '📅Years Active',
      'highestGrossing': '💰Highest Grossing',
      'awardsWon': '🏆Awards Won',
      'followers': '👨‍👩‍👧‍👦Followers',
      'languages': '🌐Languages',
      'professions': '🎭Professions'
    };

// 1️⃣ Get round number from the last card (no drama)
const latestRoundNumber = cards[cards.length - 1].roundnumber;

// 2️⃣ Reverse iterate and stop as soon as match is found
for (let i = cards.length - 1; i >= 0; i--) {
  const card = cards[i];

  // Skip if not same round
  if (card.roundnumber !== latestRoundNumber) continue;

  // Check if username is in tie players
  if (card.tiePlayersWinners?.includes(card.userName)) {
    const rawStatKey = card.selectedStat;
    // Convert stat key to full label with emoji
    statLabel = statKeyToLabel[rawStatKey] || rawStatKey;
    statValue = card[rawStatKey];
    break; // 🚨 stop immediately once found
  }
}
    if (tieUsernames.length) {
      const rounds = this.getGroupedRounds && this.getGroupedRounds();
      let latest = rounds && rounds.length ? rounds[0] : null;
      for (const username of tieUsernames) {
        let player = this.arrangedFullPlayers.find(p => p.username === username);
        let profilePic = player?.profilePicture || player?.profilePicUrl || '';
        let cardImage = '';
        if (latest && latest.cards) {
const card = latest.cards
  .slice()
  .reverse()
  .find((c: any) => (c.userName || c.username) === username);
          cardImage = card?.picture || card?.imageUrl || '';
          
        }
        this.tieStatPlayers.push({ username, profilePic, cardImage });
      }
    }
    // Set stat label and value for tie notification
    this.winnerStatLabel = statLabel;
    this.winnerStatValue = statValue;
    this.showWinnerStatNotification = true;
    this.isTie = true;
    setTimeout(() => {
      this.showWinnerStatNotification = false;
      this.isTie = false;
      this.tieStatPlayers = [];
      this.winnerStatLabel = '';
      this.winnerStatValue = '';
    }, 5000);
  }
  updateGameState(msg: any) {
    this.players = msg.players;
    this.myCards = msg.myCards;
    if (this.myCards.length < 1) {
      this.showError("You have no cards left! You are out of the game.");
      setTimeout(() => {
        this.leaveGame();
      }, 1500); // Wait 1.5 seconds so user sees the error
    }
    this.currentroundplayers = msg.currentRoundPlays;
    this.previousRoundCards = msg.currentRoundCards;
    if (this.winnerTimeout) {
      clearTimeout(this.winnerTimeout);
      this.winnerTimeout = null;
    }
    if (!msg.tie) {
      this.winner = msg.winner;
      this.isTie = false;
      this.tieStatPlayers = [];
      // Show winner stat notification if stat info is available
      if (msg.selectedStatLabel && msg.selectedStatValue !== undefined) {
        this.triggerWinnerStatNotification(msg.selectedStatLabel, msg.selectedStatValue);
      }
      this.winnerTimeout = setTimeout(() => {
        this.winner = '';
      }, 5000);
    } else if (msg.tie) {
      this.isTie = true;
      this.winner = '';
      this.triggerTieStatNotification(msg, msg.selectedStatLabel, msg.selectedStatValue);
    }
  // Show tie stat notification for all tie players


    this.currentStatSelector = msg.currentStatSelector;
    this.topCard = this.myCards && this.myCards.length ? this.myCards[0] : null;
    // Trigger winner card animation
    this.animateRoundWinner();
  }
  // Show winner stat notification with label and value
  triggerWinnerStatNotification(label: string, value: any) {
    this.winnerStatLabel = label;
    this.winnerStatValue = value;
    // Find winner info for profile pic and username
    let winnerPlayer = this.arrangedFullPlayers.find(p => p.id === this.winner || p.username === this.winner);
    if (!winnerPlayer && this.arrangedFullPlayers.length) {
      // fallback: try matching by username string
      winnerPlayer = this.arrangedFullPlayers.find(p => p.username === this.winnerStatUsername);
    }
    this.winnerStatProfilePic = winnerPlayer?.profilePicture || winnerPlayer?.profilePicUrl || '';
    this.winnerStatUsername = winnerPlayer?.username || '';

    // Try to get the winner's card image for the stat notification
    let winnerCardImage = '';
    const rounds = this.getGroupedRounds && this.getGroupedRounds();
    if (rounds && rounds.length) {
      const latest = rounds[0];
      if (latest.cards && winnerPlayer) {
        // Find the card for the winner in the latest round
        const winnerCard = latest.cards.find((c: any) => (c.userName || c.username) === winnerPlayer.username);
        winnerCardImage = winnerCard?.picture || winnerCard?.imageUrl || '';
      }
    }
    this.winnerStatCardImageUrl = winnerCardImage;

    this.showWinnerStatNotification = true;
    setTimeout(() => {
      this.showWinnerStatNotification = false;
    }, 5000);
  }
  fetchuserInfo() {
    this.api.get('/users/me').subscribe({
      next: (userData: any) => {
        if (userData && userData.errorMessage) {
          this.showError(userData.errorMessage);
          return;
        }
        this.myUsername = userData.username;
        this.myImage = userData.imageUrl;
        this.gottheusername();
      },
      error: (err) => {
        if (err?.error?.errorMessage) {
          this.showError(err.error.errorMessage);
        }
      }
    });
  }

  // Subscribe to sticker topic after username is available
  gottheusername() {
    if (this.myUsername) {
      const stickerTopic = `/topic/game/user/${this.myUsername}/stickers`;
      this.ws.connectAndSubscribe(stickerTopic);
    }
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
    if (!card.selectedStat || !stat.key) return false;
    // Compare using key (e.g., 'totalFilms') since labels contain emojis that may not match
    return stat.key.replace(/\s/g, '').toLowerCase() === card.selectedStat.replace(/\s/g, '').toLowerCase();
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
      { key: 'totalFilms', label: '🎬Total Films', value: this.topCard.totalFilms },
      { key: 'yearsActive', label: '📅Years Active', value: this.topCard.yearsActive },
      { key: 'highestGrossing', label: '💰Highest Grossing', value: this.topCard.highestGrossing },
      { key: 'awardsWon', label: '🏆Awards Won', value: this.topCard.awardsWon },
      { key: 'followers', label: '👨‍👩‍👧‍👦Followers', value: this.topCard.followers },
      { key: 'languages', label: '🌐Languages', value: this.topCard.languages },
      { key: 'professions', label: '🎭Professions', value: this.topCard.professions }
    ];
  }

  getStatList(card: any) {
    if (!card) return [];
    return [
      { key: 'totalFilms', label: '🎬Total Films', value: card.totalFilms },
      { key: 'yearsActive', label: '📅Years Active', value: card.yearsActive },
      { key: 'highestGrossing', label: '💰Highest Grossing', value: card.highestGrossing },
      { key: 'awardsWon', label: '🏆Awards Won', value: card.awardsWon },
      { key: 'followers', label: '👨‍👩‍👧‍👦Followers', value: card.followers },
      { key: 'languages', label: '🌐Languages', value: card.languages },
      { key: 'professions', label: '🎭Professions', value: card.professions }
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
    if (!cards.length) return { winner: null, winnerCount: 0, losers: [], tiePlayers: [], statLabel: '', statValue: '' };
    const winner = cards.find(c => c.winner)?.winner || '';
    const tiePlayersWinners = cards[cards.length - 1].tiePlayersWinners || [];
    const userCounts: { [user: string]: number } = {};
    cards.forEach(card => {
      const uname = card.userName || card.username;
      if (!userCounts[uname]) userCounts[uname] = 0;
      userCounts[uname]++;
    });

    // Find the winner's card
    const winnerCard = cards.find(card => (card.userName || card.username) === winner);
    // Get the selected stat key and value from the winner's card
    let statLabel = '';
    let statValue: any = '';
    if (winnerCard && winnerCard.selectedStat) {
      const statObj = this.getPrevCardStats(winnerCard).find(s =>
        s.key.replace(/\s/g, '').toLowerCase() === winnerCard.selectedStat.replace(/\s/g, '').toLowerCase()
      );
      if (statObj) {
        statLabel = statObj.label;
        statValue = statObj.value;
      }
    }

    if (winner) {
      const winnerCount = userCounts[winner] || 0;
      const losers = Object.keys(userCounts)
        .filter(u => u !== winner)
        .map(u => ({ userName: u, count: userCounts[u] }));
      return { winner, winnerCount: cards.length - winnerCount, losers, tiePlayers: [], statLabel, statValue };
    } else if (tiePlayersWinners && tiePlayersWinners.length) {
      const tiePlayers = tiePlayersWinners.map((u: string) => ({ userName: u, count: userCounts[u] || 0 }));
      const losers = Object.keys(userCounts)
        .filter(u => !tiePlayersWinners.includes(u))
        .map(u => ({ userName: u, count: userCounts[u] }));
      return { winner: null, winnerCount: 0, losers, tiePlayers, statLabel: '', statValue: '' };
    } else {
      const losers = Object.keys(userCounts).map(u => ({ userName: u, count: userCounts[u] }));
      return { winner: null, winnerCount: 0, losers, tiePlayers: [], statLabel: '', statValue: '' };
    }
  }
  fetchStickers() {
    this.api.get('/api/rooms/stickers').subscribe((stickers: any) => {
      if (stickers && stickers.errorMessage) {
        this.showError(stickers.errorMessage);
        this.stickers = [];
        return;
      }
      this.stickers = stickers as Array<{ id: number, name: string; imageUrl: string }>;
    }, err => {
      if (err?.error?.errorMessage) {
        this.showError(err.error.errorMessage);
      }
      this.stickers = [];
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
        if (res && res.errorMessage) {
          this.showError(res.errorMessage);
          return;
        }
        this.message = '';
        this.selectedStickerId = 0;
        this.fetchChatMessages(); // Refresh chat after sending
      },
      error: (err) => {
        if (err?.error?.errorMessage) {
          this.showError(err.error.errorMessage);
        }
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
      if (info && info.errorMessage) {
        this.showError(info.errorMessage);
        return;
      }
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
      if (err?.error?.errorMessage) {
        this.showError(err.error.errorMessage);
      }
    });
  }

  fetchMyCards() {
    const path = '/cards/my';
    this.api.get(path).subscribe((cards: any) => {
      if (cards && cards.errorMessage) {
        this.showError(cards.errorMessage);
        this.myCards = [];
        return;
      }
      this.myCards = cards;
      if (cards.length < 1) {
        this.showError("You have no cards left! You are out of the game.");
        setTimeout(() => {
          this.leaveGame();
        }, 1500);
      }
    }, err => {
      if (err?.error?.errorMessage) {
        this.showError(err.error.errorMessage);
      }
      this.myCards = [];
    });
  }
  showError(msg: string) {
    this.notificationMessage = msg;
    this.showNotification = true;
  }

  onNotificationClosed() {
    this.showNotification = false;
    this.notificationMessage = '';
  }
  displayStickers() {
    // Always fetch new messages when opening the panel
    this.fetchChatMessages();
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
      return;
    }
    this.api.post(`/api/rooms/${this.roomCode}/end-game`, {}).subscribe({
      next: (res: any) => {
        this.gameEnded = true;
        this.showConfirmModal = false;
        this.showGameEndedModal = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err && err.error && (err.error.message?.includes('not exist') || err.error.message?.includes('deleted'))) {
          this.errorModalMessage = 'This game no longer exists or has already ended.';
          this.showErrorModal = true;
        }
      }
    });
  }

  leaveGame() {
    if (!this.roomCode) {
      return;
    }
    this.api.post(`/api/rooms/${this.roomCode}/leave-game`, {}).subscribe({
      next: (res: any) => {
        this.gameEnded = true;
        this.showConfirmModal = false;
        this.showGameEndedModal = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err && err.error && (err.error.message?.includes('not exist') || err.error.message?.includes('deleted'))) {
          this.errorModalMessage = 'This game no longer exists or has already ended.';
          this.showErrorModal = true;
        }
      }
    });
  }
  togglePreviousRoundCards() {
    this.showPreviousRoundCards = !this.showPreviousRoundCards;
  }
  getPrevCardStats(card: any) {
    if (!card) return [];
    return [
      { key: 'totalFilms', label: '🎬Total Films', value: card.totalFilms },
      { key: 'yearsActive', label: '📅Years Active', value: card.yearsActive },
      { key: 'highestGrossing', label: '💰Highest Grossing', value: card.highestGrossing },
      { key: 'awardsWon', label: '🏆Awards Won', value: card.awardsWon },
      { key: 'followers', label: '👨‍👩‍👧‍👦Followers', value: card.followers },
      { key: 'languages', label: '🌐Languages', value: card.languages },
      { key: 'professions', label: '🎭Professions', value: card.professions }
    ];
  }
}
