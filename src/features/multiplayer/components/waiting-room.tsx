"use client";

import type { Room, RoomConfig } from "@/types/game";
import { PlayerList } from "./player-list";
import { Icon } from "@/shared/components/ui/icon";
import { useI18n } from "@/shared/i18n";
import { useState } from "react";

interface WaitingRoomProps {
  room: Room;
  playerId: string | null;
  isHost: boolean;
  onStart: () => void;
  onLeave: () => void;
  onUpdateConfig: (config: Partial<RoomConfig>) => void;
}

export function WaitingRoom({
  room,
  playerId,
  isHost,
  onStart,
  onLeave,
  onUpdateConfig,
}: WaitingRoomProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(room.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStart = () => {
    setStarting(true);
    onStart();
    // Reset after a timeout in case something goes wrong
    setTimeout(() => setStarting(false), 5000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
      {/* Left Column: Lobby Info & Players */}
      <div className="lg:col-span-8 space-y-6">
        {/* Room Code Section */}
        <section className="bg-surface-container-low p-8 rounded-lg border-l-4 border-primary-container flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant block mb-1">
              {t.multiplayer.arenaLobbyId}
            </span>
            <div className="flex items-center gap-4">
              <h1
                className="text-5xl md:text-7xl font-bold tracking-tighter text-primary-fixed glow-primary"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {room.id}
              </h1>
              <button
                onClick={copyCode}
                className="text-on-surface-variant hover:text-primary transition-colors p-2 bg-surface-container-highest rounded-lg"
              >
                <Icon name="content_copy" />
              </button>
              {copied && (
                <span className="text-xs text-primary animate-pulse">
                  {t.multiplayer.copied}
                </span>
              )}
            </div>
          </div>
          <div className="text-left md:text-right">
            <span className="text-xs uppercase tracking-[0.2em] text-primary-dim block mb-1">
              {t.multiplayer.status}
            </span>
            <p
              className="text-xl font-medium tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t.multiplayer.waitingForPlayersStatus}
            </p>
          </div>
        </section>

        {/* Player List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
              {t.multiplayer.playersCount.replace("{count}", String(room.players.length))}
            </h2>
            <div className="h-px grow mx-4 bg-outline-variant opacity-20" />
          </div>
          <PlayerList
            players={room.players}
            currentPlayerId={playerId}
            hostId={room.hostId}
          />
        </section>
      </div>

      {/* Right Column: Settings & Controls */}
      <div className="lg:col-span-4 space-y-6">
        <aside className="bg-surface-container-low p-6 rounded-lg space-y-8 sticky top-24">
          <div>
            <h3
              className="text-xl font-bold mb-6 flex items-center gap-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <Icon name="settings" className="text-primary-fixed" />
              {t.multiplayer.hostSettings}
            </h3>

            <div className="space-y-6">
              {/* Round count */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant px-1">
                  {t.multiplayer.roundCount}
                </label>
                {isHost ? (
                  <div className="relative">
                    <select
                      value={room.config.maxRounds}
                      onChange={(e) =>
                        onUpdateConfig({ maxRounds: Number(e.target.value) })
                      }
                      className="w-full bg-surface-container-highest border-0 rounded-lg py-3 px-4 appearance-none focus:ring-1 focus:ring-primary-container text-on-surface cursor-pointer"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {[3, 5, 7, 10, 15, 20].map((n) => (
                        <option key={n} value={n}>
                          {t.multiplayer.nRounds.replace("{n}", String(n))}
                        </option>
                      ))}
                    </select>
                    <Icon
                      name="expand_more"
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant"
                    />
                  </div>
                ) : (
                  <div className="w-full bg-surface-container-highest rounded-lg py-3 px-4 text-on-surface">
                    {t.multiplayer.nRounds.replace("{n}", String(room.config.maxRounds))}
                  </div>
                )}
              </div>

              {/* Round time limit */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant px-1">
                  {t.multiplayer.timeLimitPerRound}
                </label>
                {isHost ? (
                  <div className="relative">
                    <select
                      value={room.config.roundTimeLimit}
                      onChange={(e) =>
                        onUpdateConfig({ roundTimeLimit: Number(e.target.value) })
                      }
                      className="w-full bg-surface-container-highest border-0 rounded-lg py-3 px-4 appearance-none focus:ring-1 focus:ring-primary-container text-on-surface cursor-pointer"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {[3000, 5000, 8000, 10000].map((ms) => (
                        <option key={ms} value={ms}>
                          {t.multiplayer.seconds.replace("{n}", String(ms / 1000))}
                        </option>
                      ))}
                    </select>
                    <Icon
                      name="expand_more"
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant"
                    />
                  </div>
                ) : (
                  <div className="w-full bg-surface-container-highest rounded-lg py-3 px-4 text-on-surface">
                    {t.multiplayer.seconds.replace("{n}", String(room.config.roundTimeLimit / 1000))}
                  </div>
                )}
              </div>

              {/* Match rules info */}
              <div className="p-4 bg-surface-container-lowest/50 rounded-lg">
                <div className="flex items-center gap-3 text-tertiary-fixed mb-2">
                  <Icon name="info" className="text-sm" />
                  <span className="text-[10px] uppercase tracking-widest">
                    {t.multiplayer.scoring}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {t.multiplayer.scoringDesc1}{" "}
                  <span className="text-on-surface font-bold">{t.multiplayer.scoringDesc2}</span>
                  {t.multiplayer.scoringDesc3} <span className="text-on-surface font-bold">{t.multiplayer.scoringDesc4}</span>
                  {t.multiplayer.scoringDesc5} <span className="text-on-surface font-bold">{t.multiplayer.scoringDesc6}</span>
                  {t.multiplayer.scoringDesc7}
                </p>
              </div>
            </div>
          </div>

          {isHost && (
            <button
              onClick={handleStart}
              disabled={room.players.length < 2 || starting}
              className="w-full bg-primary-container text-on-primary-container font-bold text-lg py-4 rounded hover:bg-primary-fixed-dim hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary-container/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {starting ? (
                <>
                  <div className="w-5 h-5 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                  {t.multiplayer.starting}
                </>
              ) : (
                t.multiplayer.startGame
              )}
            </button>
          )}

          <button
            onClick={onLeave}
            className="w-full text-secondary text-xs uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
          >
            {isHost ? t.multiplayer.disbandLobby : t.multiplayer.leaveLobby}
          </button>

          {isHost && room.players.length < 2 && (
            <p className="text-xs text-on-surface-variant text-center">
              {t.multiplayer.minPlayers}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
