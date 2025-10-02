export interface BaseWebSocketMessage {
    eventType?: string;
    _wsTopic?: string;
}

export interface RoomInfoMessage extends BaseWebSocketMessage {
    roomCode: string;
    requiredPlayers: number;
    joinedPlayers: string[];
    joinedPlayersUsernames: string[];
    joinedCount: number;
    active: boolean;
    creatorId: string;
    status?: 'WAITING' | 'PLAYING' | 'FINISHED';
}

export interface GameStartMessage extends BaseWebSocketMessage {
    gameId: string | null;
    roomCode: string;
}

export interface GameStateMessage extends BaseWebSocketMessage {
    gameId: string;
    players: string[];
    currentPlayer?: string;
    state?: any;  // Replace with your game state type
}

export interface StartGameBundleMessage extends BaseWebSocketMessage {
    gameState: GameStateMessage;
    roomInfo: RoomInfoMessage;
    startGame: GameStartMessage;
}

export type WebSocketMessage = RoomInfoMessage | GameStartMessage | GameStateMessage | StartGameBundleMessage;

// Type guard functions
export const isGameStartMessage = (msg: any): msg is GameStartMessage => {
    return msg && 
           typeof msg.roomCode === 'string' && 
           'gameId' in msg;
};

export const isRoomInfoMessage = (msg: any): msg is RoomInfoMessage => {
    return msg && 
           typeof msg.roomCode === 'string' && 
           typeof msg.requiredPlayers === 'number' &&
           Array.isArray(msg.joinedPlayers);
};

export const isGameStateMessage = (msg: any): msg is GameStateMessage => {
    return msg && 
           typeof msg.gameId === 'string' &&
           Array.isArray(msg.players);
};

export const isStartGameBundleMessage = (msg: any): msg is StartGameBundleMessage => {
    return msg && typeof msg === 'object'
        && 'gameState' in msg
        && 'roomInfo' in msg
        && 'startGame' in msg;
};

// Helper to determine message type based on topic
export const getMessageTypeFromTopic = (topic: string) => {
    if (topic.endsWith('/start')) return 'start';
    if (topic.endsWith('/state')) return 'state';
    if (topic.includes('/rooms/')) return 'room';
    return 'unknown';
};
