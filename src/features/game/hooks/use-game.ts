import { useCallback, useEffect, useRef } from "react";
import { useGameStore } from "../store/game-store";

export function useGame() {
  const store = useGameStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRound = useCallback(() => {
    clearTimer();
    store.startWaiting();

    const delay = 1000 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      store.showSignal();
    }, delay);
  }, [clearTimer, store]);

  const handleClick = useCallback(() => {
    const { state } = useGameStore.getState();
    if (state === "idle" || state === "clicked" || state === "tooSoon") {
      startRound();
      return;
    }
    if (state === "waiting") {
      clearTimer();
      store.recordTooSoon();
      return;
    }
    if (state === "ready") {
      store.recordClick();
      return;
    }
  }, [startRound, clearTimer, store]);

  useEffect(() => {
    const s = useGameStore.getState();
    s.reset();
    s.loadBestTime();

    return clearTimer;
  }, [clearTimer]);

  return {
    state: store.state,
    reactionTime: store.reactionTime,
    bestTime: store.bestTime,
    history: store.history,
    handleClick,
    reset: store.reset,
  };
}
