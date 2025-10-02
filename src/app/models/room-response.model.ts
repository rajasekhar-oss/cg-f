export interface RoomResponse {
  roomCode: string;
  requiredPlayers: number;
  active: boolean;
  joinedPlayers: string[]; // UUIDs as strings
  message: string;
  joinedPlayersUsernames: string[];
}
