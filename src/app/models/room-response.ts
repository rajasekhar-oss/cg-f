export interface JoinedUser {
  id: string;
  name: string;
}

export interface RoomResponse {
  roomCode: string;
  requiredPlayers: number;
  joinedPlayers: JoinedUser[];
  error?: string;
}
