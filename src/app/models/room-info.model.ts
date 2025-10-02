export interface RoomInfoDto {
  roomCode: string;
  requiredPlayers: number;
  joinedPlayers: string[]; // UUIDs as strings
  active: boolean;
  creatorId: string; // UUID as string
  joinedPlayersUsernames: string[];
  eventType?: string;
}
