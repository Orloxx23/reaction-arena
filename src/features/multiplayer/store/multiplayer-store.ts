import { create } from "zustand";
import type { GameState, MultiplayerPlayer, Room, RoomConfig, RoundResult } from "@/types/game";

interface MultiplayerStore {
  room: Room | null;
  playerId: string | null;
  nickname: string;
  error: string | null;
  roundResult: RoundResult | null;
  winnerId: string | null;
  countdown: number | null;
  goTimestamp: number | null;

  setNickname: (nickname: string) => void;
  setPlayerId: (id: string) => void;
  setRoom: (room: Room | null) => void;
  setError: (error: string | null) => void;
  setRoundResult: (result: RoundResult | null) => void;
  setWinnerId: (id: string | null) => void;
  setCountdown: (n: number | null) => void;
  setGoTimestamp: (ts: number | null) => void;

  updatePlayer: (playerId: string, updates: Partial<MultiplayerPlayer>) => void;
  addPlayer: (player: MultiplayerPlayer) => void;
  removePlayer: (playerId: string) => void;
  updateRoomConfig: (config: Partial<RoomConfig>) => void;
  setRoomState: (state: GameState) => void;

  isHost: () => boolean;
  currentPlayer: () => MultiplayerPlayer | undefined;
  reset: () => void;
}

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  room: null,
  playerId: null,
  nickname: "",
  error: null,
  roundResult: null,
  winnerId: null,
  countdown: null,
  goTimestamp: null,

  setNickname: (nickname) => set({ nickname }),
  setPlayerId: (id) => set({ playerId: id }),
  setRoom: (room) => set({ room, error: null }),
  setError: (error) => set({ error }),
  setRoundResult: (result) => set({ roundResult: result }),
  setWinnerId: (id) => set({ winnerId: id }),
  setCountdown: (n) => set({ countdown: n }),
  setGoTimestamp: (ts) => set({ goTimestamp: ts }),

  updatePlayer: (playerId, updates) =>
    set((s) => {
      if (!s.room) return s;
      return {
        room: {
          ...s.room,
          players: s.room.players.map((p) =>
            p.id === playerId ? { ...p, ...updates } : p
          ),
        },
      };
    }),

  addPlayer: (player) =>
    set((s) => {
      if (!s.room) return s;
      if (s.room.players.some((p) => p.id === player.id)) return s;
      return {
        room: {
          ...s.room,
          players: [...s.room.players, player],
        },
      };
    }),

  removePlayer: (playerId) =>
    set((s) => {
      if (!s.room) return s;
      return {
        room: {
          ...s.room,
          players: s.room.players.filter((p) => p.id !== playerId),
        },
      };
    }),

  updateRoomConfig: (config) =>
    set((s) => {
      if (!s.room) return s;
      return {
        room: {
          ...s.room,
          config: { ...s.room.config, ...config },
        },
      };
    }),

  setRoomState: (state) =>
    set((s) => {
      if (!s.room) return s;
      return { room: { ...s.room, state } };
    }),

  isHost: () => {
    const { room, playerId } = get();
    return room?.hostId === playerId;
  },

  currentPlayer: () => {
    const { room, playerId } = get();
    return room?.players.find((p) => p.id === playerId);
  },

  reset: () =>
    set({
      room: null,
      playerId: null,
      error: null,
      roundResult: null,
      winnerId: null,
      countdown: null,
      goTimestamp: null,
    }),
}));
