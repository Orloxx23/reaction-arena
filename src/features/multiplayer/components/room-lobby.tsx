"use client";

import { useState } from "react";
import { Icon } from "@/shared/components/ui/icon";
import { useI18n } from "@/shared/i18n";

interface RoomLobbyProps {
  onCreate: () => void;
  onJoin: (roomId: string) => void;
  error: string | null;
}

export function RoomLobby({ onCreate, onJoin, error }: RoomLobbyProps) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"menu" | "join">("menu");
  const [roomCode, setRoomCode] = useState("");

  if (mode === "join") {
    return (
      <div className="glass-panel w-full max-w-sm p-8 border border-outline-variant/15 rounded-lg shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-fixed to-transparent opacity-50" />

        <h2
          className="text-2xl font-bold tracking-tighter uppercase mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {t.multiplayer.joinRoom}
        </h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">
              {t.multiplayer.arenaLobbyId}
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder={t.multiplayer.roomCodePlaceholder}
              maxLength={6}
              autoFocus
              className="w-full bg-surface-container-highest border border-outline-variant/30 px-5 py-4 text-3xl font-bold tracking-[0.3em] text-center uppercase focus:outline-none focus:ring-0 neon-focus transition-all placeholder:text-outline/40 text-on-surface rounded"
              style={{ fontFamily: "var(--font-heading)" }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setMode("menu")}
              className="flex-1 text-secondary text-xs uppercase tracking-widest hover:text-white transition-colors py-3"
            >
              {t.multiplayer.back}
            </button>
            <button
              onClick={() => onJoin(roomCode.trim())}
              disabled={roomCode.trim().length < 4}
              className="flex-1 bg-primary-container text-on-primary-container font-bold text-lg py-4 rounded hover:bg-primary-fixed-dim disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all neon-glow"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t.multiplayer.join}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-error text-xs text-center mt-4">{error}</p>
        )}
      </div>
    );
  }

  // Menu mode - two big buttons, create goes straight to lobby
  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <button
        onClick={onCreate}
        className="group relative flex items-center justify-between px-8 py-6 bg-primary-container text-on-primary font-bold text-xl tracking-tight transition-all duration-300 hover:bg-primary-fixed hover:shadow-[0_0_32px_rgba(0,236,59,0.2)] active:scale-95 rounded-lg"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <span>{t.multiplayer.createRoom}</span>
        <Icon
          name="bolt"
          className="group-hover:translate-x-1 transition-transform"
        />
      </button>
      <button
        onClick={() => setMode("join")}
        className="group relative flex items-center justify-between px-8 py-6 bg-surface-container-highest text-on-surface font-bold text-xl tracking-tight transition-all duration-300 hover:bg-surface-bright active:scale-95 rounded-lg outline outline-1 outline-outline-variant/15"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <span>{t.multiplayer.joinRoomBtn}</span>
        <Icon
          name="groups"
          className="group-hover:translate-x-1 transition-transform"
        />
      </button>
      {error && (
        <p className="text-error text-sm text-center">{error}</p>
      )}
    </div>
  );
}
