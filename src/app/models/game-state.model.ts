export interface GameStateDto {
  gameId: string;
  players: PlayerInfo[];
  deckSizes: { [userId: string]: number };
  spectators: string[];
  currentPlays: { [userId: string]: number };
  finished: boolean;
  winner: string;
  roundInfo?: RoundInfo;
  currentStatSelector: string;
  myUserId: string;
}

export interface PlayerInfo {
  username: string; // user ID string
  displayName: string; // name to show in UI
  profilePicUrl?: string;
}

export interface RoundInfo {
  statSelected: string;
  cardValues: { [userId: string]: number };
  roundWinner: string;
  tie: boolean;
  tiedPlayers: string[];
}
