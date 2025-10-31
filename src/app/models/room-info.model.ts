export interface RoomInfoDto {
  roomCode: string;
  requiredPlayers: number;
  joinedPlayers: string[]; // UUIDs as strings
  creatorId: string; // UUID as string
  joinedPlayersUsernames: string[];
}
