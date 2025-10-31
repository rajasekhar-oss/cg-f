import { CurrentRoundCardDto } from "./CurrentRoundCardDto";

export interface GameInfo {
    roomCode: string;
    players: string[];
    activePlayers: string[];
    CurrentStatSelector: string;
    currentRoundCards: CurrentRoundCardDto[];
    creatorId: string;
    playersUsernames: string[];
}

