import { create } from "zustand";
import type { GameResult, GameState } from "@/types/game";

interface GameStore {
  state: GameState;
  reactionTime: number | null;
  bestTime: number | null;
  history: GameResult[];
  signalTimestamp: number | null;
  hasClicked: boolean;

  setState: (state: GameState) => void;
  startWaiting: () => void;
  showSignal: () => void;
  recordClick: () => void;
  recordTooSoon: () => void;
  reset: () => void;
  loadBestTime: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: "idle",
  reactionTime: null,
  bestTime: null,
  history: [],
  signalTimestamp: null,
  hasClicked: false,

  setState: (state) => set({ state }),

  startWaiting: () =>
    set({ state: "waiting", reactionTime: null, hasClicked: false, signalTimestamp: null }),

  showSignal: () =>
    set({ state: "ready", signalTimestamp: performance.now() }),

  recordClick: () => {
    const { signalTimestamp, hasClicked, bestTime } = get();
    if (hasClicked) return;

    const reactionTime = signalTimestamp
      ? Math.round(performance.now() - signalTimestamp)
      : null;

    const result: GameResult = {
      reactionTime,
      tooSoon: false,
      timestamp: Date.now(),
    };

    let newBest = bestTime;
    if (reactionTime !== null && (bestTime === null || reactionTime < bestTime)) {
      newBest = reactionTime;
      try {
        localStorage.setItem("reaction-royale-best", String(newBest));
      } catch {}
    }

    set((s) => ({
      state: "clicked",
      reactionTime,
      hasClicked: true,
      bestTime: newBest,
      history: [result, ...s.history].slice(0, 20),
    }));
  },

  recordTooSoon: () => {
    const { hasClicked } = get();
    if (hasClicked) return;

    const result: GameResult = {
      reactionTime: null,
      tooSoon: true,
      timestamp: Date.now(),
    };

    set((s) => ({
      state: "tooSoon",
      reactionTime: null,
      hasClicked: true,
      history: [result, ...s.history].slice(0, 20),
    }));
  },

  reset: () =>
    set({ state: "idle", reactionTime: null, signalTimestamp: null, hasClicked: false }),

  loadBestTime: () => {
    try {
      const stored = localStorage.getItem("reaction-royale-best");
      if (stored) set({ bestTime: Number(stored) });
    } catch {}
  },
}));
