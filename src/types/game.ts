export type GameState =
  | "idle"
  | "waiting"
  | "ready"
  | "clicked"
  | "tooSoon"
  | "timedOut"
  | "roundEnd"
  | "gameOver";

export interface GameResult {
  reactionTime: number | null;
  tooSoon: boolean;
  timestamp: number;
}

export interface MultiplayerPlayer {
  id: string;
  nickname: string;
  score: number;
  ready: boolean;
  reactionTime: number | null;
  state: GameState;
  connected: boolean;
}

export interface RoomConfig {
  maxRounds: number;
  minDelay: number;
  maxDelay: number;
  roundTimeLimit: number; // ms — max time to click after "GO" before auto-fail
}

export interface Room {
  id: string;
  hostId: string;
  players: MultiplayerPlayer[];
  config: RoomConfig;
  currentRound: number;
  state: GameState;
  createdAt: number;
}

export interface RoundResult {
  round: number;
  players: Array<{
    id: string;
    nickname: string;
    reactionTime: number | null;
    tooSoon: boolean;
    timedOut: boolean;
    pointsEarned: number;
  }>;
}

// Points awarded by finishing position (1st, 2nd, 3rd...)
export const POINTS_BY_RANK = [100, 80, 60, 40, 30, 20, 10, 5];

export const DEFAULT_ROOM_CONFIG: RoomConfig = {
  maxRounds: 10,
  minDelay: 1000,
  maxDelay: 3000,
  roundTimeLimit: 5000, // 5 seconds to click after GO
};
