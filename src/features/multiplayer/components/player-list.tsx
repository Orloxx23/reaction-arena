"use client";

import type { MultiplayerPlayer } from "@/types/game";
import { Icon } from "@/shared/components/ui/icon";
import { useI18n } from "@/shared/i18n";

interface PlayerListProps {
  players: MultiplayerPlayer[];
  currentPlayerId: string | null;
  hostId: string;
}

export function PlayerList({
  players,
  currentPlayerId,
  hostId,
}: PlayerListProps) {
  const { t } = useI18n();
  return (
    <div className="grid gap-3">
      {players.map((player) => {
        const isYou = player.id === currentPlayerId;
        const isHost = player.id === hostId;

        return (
          <div
            key={player.id}
            className={`group flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
              !player.connected
                ? "bg-surface-container/50 opacity-40"
                : "bg-surface-container hover:bg-surface-bright"
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className={`w-12 h-12 flex items-center justify-center rounded ${
                  isHost
                    ? "bg-primary-container/10 border border-primary-container/20"
                    : "bg-surface-container-highest"
                }`}
              >
                <Icon
                  name="person"
                  className={isHost ? "text-primary-fixed" : "text-on-surface-variant"}
                />
              </div>

              {/* Name */}
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-lg font-bold"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {player.nickname.toUpperCase()}
                    {isYou && (
                      <span className="text-xs ml-1.5 text-on-surface-variant font-normal normal-case">
                        {t.multiplayer.youLower}
                      </span>
                    )}
                  </span>
                  {isHost && (
                    <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">
                      {t.multiplayer.host}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="text-right">
              {player.state === "clicked" && player.reactionTime !== null && (
                <>
                  <span className="text-[10px] text-on-surface-variant uppercase block">
                    {t.multiplayer.ping}
                  </span>
                  <p
                    className="text-primary-dim font-medium"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {player.reactionTime}ms
                  </p>
                </>
              )}
              {player.state === "tooSoon" && (
                <span className="text-xs text-error font-bold uppercase">
                  {t.multiplayer.tooSoonStatus}
                </span>
              )}
              {!player.connected && (
                <span className="text-xs text-on-surface-variant uppercase tracking-wider">
                  {t.multiplayer.offline}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Empty slot placeholder */}
      <div className="border-2 border-dashed border-outline-variant/20 flex items-center justify-center p-4 rounded-lg opacity-40">
        <span className="text-xs uppercase tracking-widest">
          {t.multiplayer.waitingForConnector}
        </span>
      </div>
    </div>
  );
}
