import type { MultiplayerPlayer, Room, RoomConfig, RoundResult } from "./game";

export interface ServerToClientEvents {
  "room:created": (room: Room) => void;
  "room:updated": (room: Room) => void;
  "room:player-joined": (player: MultiplayerPlayer) => void;
  "room:player-left": (playerId: string) => void;
  "room:error": (message: string) => void;

  "game:starting": (countdown: number) => void;
  "game:waiting": () => void;
  "game:go": (timestamp: number) => void;
  "game:player-clicked": (
    playerId: string,
    reactionTime: number | null,
    tooSoon: boolean,
    timedOut: boolean
  ) => void;
  "game:round-end": (result: RoundResult) => void;
  "game:over": (winnerId: string) => void;

  "player:disconnected": (playerId: string) => void;
  "player:reconnected": (playerId: string) => void;
}

export interface ClientToServerEvents {
  "room:create": (
    nickname: string,
    config: RoomConfig,
    callback: (roomId: string | null) => void
  ) => void;
  "room:join": (
    roomId: string,
    nickname: string,
    callback: (success: boolean, error?: string) => void
  ) => void;
  "room:leave": () => void;
  "room:update-config": (
    config: Partial<RoomConfig>,
    callback: (success: boolean) => void
  ) => void;

  "game:start": () => void;
  "game:click": (timestamp: number) => void;
  "game:ready": () => void;
  "game:play-again": () => void;
}
