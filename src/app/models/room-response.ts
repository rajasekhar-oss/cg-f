export interface RoomResponse {
  roomCode: string;
  requiredPlayers: number;
  joinedPlayers: string[];
  joinedPlayersUsernames: string[];
  active?: boolean;
  creatorId?: string;
  error?: string;
}
