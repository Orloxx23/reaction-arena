"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMultiplayerStore } from "../store/multiplayer-store";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/realtime/socket";
import { DEFAULT_ROOM_CONFIG, type RoomConfig } from "@/types/game";

export function useMultiplayer() {
  const store = useMultiplayerStore();
  const listenersAttached = useRef(false);

  const attachListeners = useCallback(() => {
    if (listenersAttached.current) return;
    const socket = getSocket();

    socket.on("connect", () => {
      store.setPlayerId(socket.id!);
    });

    socket.on("room:created", (room) => {
      store.setRoom(room);
    });

    socket.on("room:updated", (room) => {
      // Ignore broadcasts after we've left the room
      const { playerId } = useMultiplayerStore.getState();
      if (!playerId) return;
      store.setRoom(room);
    });

    socket.on("room:player-joined", (player) => {
      if (!useMultiplayerStore.getState().playerId) return;
      store.addPlayer(player);
    });

    socket.on("room:player-left", (playerId) => {
      if (!useMultiplayerStore.getState().playerId) return;
      store.removePlayer(playerId);
    });

    socket.on("room:error", (message) => {
      store.setError(message);
    });

    socket.on("game:starting", (countdown) => {
      store.setCountdown(countdown);
      store.setRoundResult(null);
      store.setWinnerId(null);
    });

    socket.on("game:waiting", () => {
      store.setCountdown(null);
      store.setRoomState("waiting");
    });

    socket.on("game:go", (timestamp) => {
      store.setGoTimestamp(timestamp);
      store.setRoomState("ready");
    });

    socket.on("game:player-clicked", (playerId, reactionTime, tooSoon, timedOut) => {
      store.updatePlayer(playerId, {
        reactionTime,
        state: timedOut ? "timedOut" : tooSoon ? "tooSoon" : "clicked",
      });
    });

    socket.on("game:round-end", (result) => {
      store.setRoundResult(result);
      store.setRoomState("roundEnd");
    });

    socket.on("game:over", (winnerId) => {
      store.setWinnerId(winnerId);
      store.setRoomState("gameOver");
    });

    socket.on("player:disconnected", (playerId) => {
      store.updatePlayer(playerId, { connected: false });
    });

    socket.on("player:reconnected", (playerId) => {
      store.updatePlayer(playerId, { connected: true });
    });

    listenersAttached.current = true;
  }, [store]);

  const connect = useCallback(() => {
    attachListeners();
    const socket = connectSocket();
    store.setPlayerId(socket.id ?? "");
  }, [attachListeners, store]);

  const createRoom = useCallback(
    (config?: RoomConfig) => {
      const socket = getSocket();
      socket.emit("room:create", store.nickname, config ?? DEFAULT_ROOM_CONFIG, (roomId) => {
        if (!roomId) {
          store.setError("Failed to create room");
        }
      });
    },
    [store]
  );

  const updateConfig = useCallback(
    (config: Partial<RoomConfig>) => {
      const socket = getSocket();
      if (!socket.connected) {
        store.setError("Not connected to server");
        return;
      }
      // Optimistic update: apply config change locally immediately
      store.updateRoomConfig(config);
      socket.emit("room:update-config", config, (success) => {
        if (!success) {
          store.setError("Failed to update config");
        }
      });
    },
    [store]
  );

  const joinRoom = useCallback(
    (roomId: string) => {
      const socket = getSocket();
      socket.emit("room:join", roomId, store.nickname, (success, error) => {
        if (!success) {
          store.setError(error ?? "Failed to join room");
        }
      });
    },
    [store]
  );

  const leaveRoom = useCallback(() => {
    const socket = getSocket();
    socket.emit("room:leave");
    // Clear room state but keep nickname and playerId (socket is still connected)
    store.setRoom(null);
    store.setRoundResult(null);
    store.setWinnerId(null);
    store.setCountdown(null);
    store.setGoTimestamp(null);
    store.setError(null);
  }, [store]);

  const startGame = useCallback(() => {
    const socket = getSocket();
    socket.emit("game:start");
  }, []);

  const sendClick = useCallback(() => {
    const socket = getSocket();
    socket.emit("game:click", performance.now());
  }, []);

  const sendReady = useCallback(() => {
    const socket = getSocket();
    socket.emit("game:ready");
  }, []);

  const playAgain = useCallback(() => {
    const socket = getSocket();
    socket.emit("game:play-again");
    store.setRoundResult(null);
    store.setWinnerId(null);
  }, [store]);

  const disconnect = useCallback(() => {
    disconnectSocket();
    store.reset();
    listenersAttached.current = false;
  }, [store]);

  // If component mounts with stale room state but no socket connection, reset
  useEffect(() => {
    const { room, nickname } = useMultiplayerStore.getState();
    if (room && nickname) {
      const socket = getSocket();
      if (!socket.connected) {
        useMultiplayerStore.getState().reset();
      }
    }
  }, []);

  return {
    ...store,
    connect,
    createRoom,
    updateConfig,
    joinRoom,
    leaveRoom,
    startGame,
    sendClick,
    sendReady,
    playAgain,
    disconnect,
  };
}
