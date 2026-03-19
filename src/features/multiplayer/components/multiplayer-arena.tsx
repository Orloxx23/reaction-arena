"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMultiplayerStore } from "../store/multiplayer-store";
import { getSocket } from "@/lib/realtime/socket";
import { Icon } from "@/shared/components/ui/icon";

function useElapsedTimer(running: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!running) {
      // Keep the last value — don't reset to 0
      return;
    }
    // Reset when starting a new timing cycle
    setElapsed(0);
    startRef.current = performance.now();
    let raf: number;
    const tick = () => {
      setElapsed(Math.round(performance.now() - startRef.current));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  return elapsed;
}

function formatTimer(ms: number) {
  const secs = Math.floor(ms / 1000);
  const millis = ms % 1000;
  return { secs: String(secs).padStart(2, "0"), millis: String(millis).padStart(3, "0") };
}

interface MultiplayerArenaProps {
  onPlayAgain: () => void;
  onLeave: () => void;
}

export function MultiplayerArena({ onPlayAgain, onLeave }: MultiplayerArenaProps) {
  const room = useMultiplayerStore((s) => s.room);
  const playerId = useMultiplayerStore((s) => s.playerId);
  const roundResult = useMultiplayerStore((s) => s.roundResult);
  const winnerId = useMultiplayerStore((s) => s.winnerId);
  const countdown = useMultiplayerStore((s) => s.countdown);
  const clickGuard = useRef(false);
  const goReceivedAt = useRef<number>(0);
  const [hasClicked, setHasClicked] = useState(false);
  const [myReactionTime, setMyReactionTime] = useState<number | null>(null);
  const [clickedTooSoon, setClickedTooSoon] = useState(false);

  const gameState = room?.state ?? "idle";

  // Live timer — only runs during "ready" (green) phase
  const timerRunning = gameState === "ready" && !hasClicked;
  const elapsed = useElapsedTimer(timerRunning);

  // Track when the "go" signal arrives on the client
  const prevGameState = useRef(gameState);
  if (gameState === "ready" && prevGameState.current !== "ready") {
    goReceivedAt.current = performance.now();
  }
  prevGameState.current = gameState;

  const handleClick = useCallback(() => {
    if (clickGuard.current) return;

    if (gameState === "waiting") {
      clickGuard.current = true;
      setHasClicked(true);
      setClickedTooSoon(true);
      setMyReactionTime(null);
      const socket = getSocket();
      socket.emit("game:click", 0);
      return;
    }

    if (gameState === "ready") {
      clickGuard.current = true;
      const clientTime = Math.round(performance.now() - goReceivedAt.current);
      setHasClicked(true);
      setMyReactionTime(clientTime);
      setClickedTooSoon(false);
      const socket = getSocket();
      socket.emit("game:click", clientTime);
      return;
    }
  }, [gameState]);

  // Reset click state when entering a new round or returning to idle
  const prevResetState = useRef(gameState);
  useEffect(() => {
    if (gameState === "waiting" && prevResetState.current !== "waiting") {
      clickGuard.current = false;
      setHasClicked(false);
      setMyReactionTime(null);
      setClickedTooSoon(false);
    }
    if (gameState === "idle") {
      clickGuard.current = false;
      setHasClicked(false);
      setMyReactionTime(null);
      setClickedTooSoon(false);
    }
    prevResetState.current = gameState;
  }, [gameState]);

  const winnerPlayer = winnerId
    ? room?.players.find((p) => p.id === winnerId)
    : null;

  // Count how many active players have clicked this round
  const activePlayers = room?.players.filter((p) => p.connected) ?? [];
  const clickedCount = activePlayers.filter(
    (p) => p.state === "clicked" || p.state === "tooSoon" || p.state === "timedOut"
  ).length;
  const totalActive = activePlayers.length;

  // Sorted scoreboard for the HUD
  const scoreboard = [...(room?.players ?? [])].sort((a, b) => b.score - a.score);

  const showClickedFeedback = hasClicked && (gameState === "ready" || gameState === "waiting");

  const bgClass = showClickedFeedback
    ? "bg-surface-container-lowest"
    : gameState === "waiting"
    ? "bg-[#CC0000]"
    : gameState === "ready"
    ? "bg-[#00FF41]"
    : "bg-background";

  // Clickable game area (waiting/ready states)
  if (gameState === "waiting" || gameState === "ready") {
    return (
      <div className="flex flex-col grow w-full">
        <button
          type="button"
          onClick={handleClick}
          disabled={hasClicked}
          className={`grow flex flex-col items-center justify-center cursor-pointer select-none transition-colors duration-150 disabled:cursor-default relative overflow-hidden ${bgClass}`}
        >
          {/* Round indicator */}
          {room && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-surface-container-lowest/40 backdrop-blur-xl px-8 py-3 rounded-xl border border-outline-variant/10">
                <span
                  className={`text-2xl font-bold tracking-widest uppercase ${
                    gameState === "ready" && !hasClicked
                      ? "text-surface-container-lowest"
                      : "text-on-surface"
                  }`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Round {room.currentRound} of {room.config.maxRounds}
                </span>
              </div>
            </div>
          )}

          <div className="text-center select-none z-10">
            {/* Countdown */}
            {countdown !== null && (
              <p
                className="text-8xl font-bold text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {countdown}
              </p>
            )}

            {/* WAITING - not yet clicked */}
            {gameState === "waiting" && countdown === null && !hasClicked && (
              <>
                <h1
                  className="text-[4rem] md:text-[10rem] font-extrabold tracking-tighter leading-none italic text-white drop-shadow-2xl"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  WAIT...
                </h1>
                <p className="text-white/60 text-lg tracking-[0.4em] font-bold uppercase mt-4">
                  Don&apos;t click yet!
                </p>
              </>
            )}

            {/* CLICKED TOO SOON */}
            {hasClicked && clickedTooSoon && (
              <div className="flex flex-col items-center gap-4">
                <h1
                  className="text-[3rem] md:text-[6rem] font-extrabold tracking-tighter leading-none italic text-error drop-shadow-2xl"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  TOO SOON!
                </h1>
                <p className="text-on-surface-variant text-base tracking-[0.2em] font-bold uppercase">
                  0 points this round
                </p>
                <p className="text-on-surface-variant/60 text-lg tracking-[0.2em] font-bold uppercase mt-2">
                  Waiting for other players...
                </p>
                <div className="flex items-center gap-2 mt-2 text-on-surface-variant/60">
                  <div className="w-2 h-2 rounded-full bg-on-surface-variant/40 animate-pulse" />
                  <span className="text-sm font-mono">
                    {clickedCount} / {totalActive} clicked
                  </span>
                </div>
              </div>
            )}

            {/* READY - not yet clicked */}
            {gameState === "ready" && !hasClicked && (
              <>
                <h1
                  className="text-[4rem] md:text-[14rem] font-extrabold tracking-tighter leading-none italic text-surface-container-lowest drop-shadow-2xl"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  CLICK NOW!
                </h1>
                <p className="text-surface-container-lowest/60 text-lg tracking-[0.4em] font-bold uppercase mt-4">
                  React instantly!
                </p>
              </>
            )}

            {/* CLICKED SUCCESSFULLY - waiting for others */}
            {hasClicked && !clickedTooSoon && myReactionTime !== null && (
              <div className="flex flex-col items-center gap-4">
                <p className="text-on-surface-variant text-sm font-bold uppercase tracking-[0.2em]">
                  Your reaction time
                </p>
                <div className="flex items-baseline gap-2">
                  <h1
                    className="text-[4rem] md:text-[8rem] font-extrabold tracking-tighter leading-none text-primary"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {myReactionTime}
                  </h1>
                  <span
                    className="text-2xl md:text-4xl font-bold text-primary/60"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    ms
                  </span>
                </div>
                <p className="text-on-surface-variant text-lg tracking-[0.2em] font-bold uppercase">
                  Waiting for other players...
                </p>
                <div className="flex items-center gap-2 mt-2 text-on-surface-variant/60">
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                  <span className="text-sm font-mono">
                    {clickedCount} / {totalActive} clicked
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* HUD Side Panel — Scoreboard */}
          {room && (
            <ScoreboardHUD
              players={scoreboard}
              playerId={playerId}
              gameState={gameState}
            />
          )}

          {/* Bottom timer */}
          {countdown === null && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none z-20">
              <TimerDisplay elapsed={elapsed} timeLimit={room?.config.roundTimeLimit ?? 5000} gameState={gameState} />
            </div>
          )}

          {/* Edge textures */}
          <div className="fixed inset-0 pointer-events-none border-24 border-surface-container-lowest/5 mix-blend-overlay" />
          {gameState === "ready" && !hasClicked && (
            <div className="fixed inset-0 pointer-events-none bg-linear-to-t from-surface-container-lowest/20 to-transparent" />
          )}
        </button>
      </div>
    );
  }

  // Round end state
  if (gameState === "roundEnd" && roundResult) {
    return (
      <div className="flex flex-col grow w-full bg-background">
        <div className="grow flex flex-col items-center justify-center relative overflow-hidden px-4">
          {/* Round indicator */}
          {room && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-surface-container-lowest/40 backdrop-blur-xl px-8 py-3 rounded-xl border border-outline-variant/10">
                <span
                  className="text-2xl font-bold tracking-widest uppercase text-on-surface"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Round {room.currentRound - 1} of {room.config.maxRounds}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-6 z-10">
            <div className="text-on-surface-variant text-sm font-bold uppercase tracking-[0.2em]">
              Round {roundResult.round} Results
            </div>
            <div className="w-full max-w-md grid grid-cols-1 gap-4">
              {[...roundResult.players]
                .sort((a, b) => {
                  const aFailed = a.tooSoon || a.timedOut;
                  const bFailed = b.tooSoon || b.timedOut;
                  if (aFailed && !bFailed) return 1;
                  if (!aFailed && bFailed) return -1;
                  return (
                    (a.reactionTime ?? Infinity) -
                    (b.reactionTime ?? Infinity)
                  );
                })
                .map((p, i) => {
                  const isYou = p.id === playerId;
                  const failed = p.tooSoon || p.timedOut;
                  return (
                    <div
                      key={p.id}
                      className={`p-6 flex flex-col ${
                        failed
                          ? "bg-error-container/20 border-l-4 border-error"
                          : i === 0
                          ? "bg-surface-container-highest border-l-4 border-primary shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                          : "bg-surface-container"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold tracking-widest ${
                            i === 0 && !failed ? "text-primary" : "text-on-surface-variant"
                          }`}
                        >
                          RANK {String(i + 1).padStart(2, "0")}
                          {isYou && " (YOU)"}
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            p.pointsEarned > 0 ? "text-primary" : "text-on-surface-variant"
                          }`}
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          +{p.pointsEarned} pts
                        </span>
                      </div>
                      <span
                        className="text-xl font-bold text-on-surface"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {p.nickname.toUpperCase()}
                      </span>
                      <span
                        className={`text-3xl font-bold mt-2 ${
                          failed
                            ? "text-error"
                            : i === 0
                            ? "text-primary-fixed-dim"
                            : "text-on-surface"
                        }`}
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {p.timedOut ? "TIME'S UP" : p.tooSoon ? "TOO SOON" : `${p.reactionTime}`}
                        {!failed && (
                          <span className="text-xs ml-1">MS</span>
                        )}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Next round loading indicator */}
            <div className="flex items-center gap-3 mt-4 text-on-surface-variant/60">
              <div className="w-4 h-4 border-2 border-on-surface-variant/20 border-t-primary rounded-full animate-spin" />
              <span className="text-sm uppercase tracking-widest">
                Next round starting...
              </span>
            </div>
          </div>

          {/* HUD Side Panel */}
          {room && (
            <ScoreboardHUD
              players={scoreboard}
              playerId={playerId}
              gameState={gameState}
            />
          )}
        </div>
      </div>
    );
  }

  // Game over state
  if (gameState === "gameOver" && winnerPlayer && room) {
    const isWinner = winnerPlayer.id === playerId;
    const finalScoreboard = [...room.players].sort((a, b) => b.score - a.score);

    return (
      <div className="flex flex-col grow w-full bg-background relative overflow-hidden">
        <div className="grow flex flex-col items-center justify-center px-4 z-10">
          <div className="flex flex-col items-center gap-6">
            {/* Trophy icon */}
            <div className="p-6 bg-surface-container-highest/20 backdrop-blur-xl rounded-xl border border-outline-variant/15 flex items-center justify-center">
              <Icon
                name="emoji_events"
                filled
                className="text-primary"
                size="80px"
              />
            </div>
            <h1
              className="text-7xl md:text-9xl font-bold tracking-tighter uppercase leading-none victory-glow"
              style={{
                fontFamily: "var(--font-heading)",
                color: isWinner ? "#00fc40" : "#ffffff",
              }}
            >
              {isWinner
                ? "YOU WIN!"
                : `${winnerPlayer.nickname.toUpperCase()} WINS!`}
            </h1>
            <p className="text-sm uppercase tracking-[0.2em] text-on-surface-variant">
              {room.currentRound - 1} rounds played
            </p>

            {/* Final scoreboard */}
            <div className="w-full max-w-md mt-8 space-y-2">
              <h3 className="text-[10px] uppercase tracking-widest text-on-surface-variant text-center mb-4">
                Final Standings
              </h3>
              {finalScoreboard.map((p, i) => {
                const isYou = p.id === playerId;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      i === 0
                        ? "bg-primary-container/20 border border-primary/20"
                        : "bg-surface-container"
                    } ${isYou ? "ring-1 ring-primary/30" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-lg font-bold w-8 ${
                          i === 0 ? "text-primary" : "text-on-surface-variant"
                        }`}
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        #{i + 1}
                      </span>
                      <span
                        className="font-bold text-on-surface"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {p.nickname.toUpperCase()}
                        {isYou && (
                          <span className="text-xs ml-1 text-on-surface-variant font-normal">
                            (you)
                          </span>
                        )}
                      </span>
                    </div>
                    <span
                      className={`text-xl font-bold ${
                        i === 0 ? "text-primary" : "text-on-surface"
                      }`}
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {p.score}
                      <span className="text-xs ml-1 text-on-surface-variant">pts</span>
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {room.hostId === playerId ? (
                <button
                  type="button"
                  onClick={() => onPlayAgain()}
                  className="bg-primary-container text-on-primary-container font-bold text-lg px-12 py-5 rounded tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all shadow-[0_0_32px_rgba(0,252,64,0.2)] cursor-pointer"
                >
                  PLAY AGAIN
                </button>
              ) : (
                <div className="flex items-center gap-3 px-12 py-5 text-on-surface-variant">
                  <div className="w-4 h-4 border-2 border-on-surface-variant/20 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm uppercase tracking-widest">
                    Waiting for host...
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => onLeave()}
                className="bg-surface-variant text-on-surface font-bold text-lg px-12 py-5 rounded tracking-widest uppercase hover:bg-surface-bright active:scale-95 transition-all border border-outline-variant/20 cursor-pointer"
              >
                EXIT ARENA
              </button>
            </div>
          </div>
        </div>

        {/* Confetti overlay */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-20">
          <div className="absolute top-10 left-[10%] w-2 h-2 bg-primary rotate-45" />
          <div className="absolute top-20 right-[15%] w-3 h-3 bg-secondary rotate-12" />
          <div className="absolute top-[40%] left-[5%] w-2 h-6 bg-tertiary-fixed -rotate-12" />
          <div className="absolute bottom-[20%] right-[10%] w-4 h-1 bg-primary-container rotate-[70deg]" />
          <div className="absolute top-[15%] left-[50%] w-2 h-2 bg-on-primary-fixed rotate-45" />
          <div className="absolute bottom-[10%] left-[20%] w-3 h-3 bg-primary rotate-45" />
        </div>
      </div>
    );
  }

  // Countdown state (before first round)
  if (countdown !== null) {
    return (
      <div className="flex flex-col grow w-full bg-background">
        <div className="grow flex flex-col items-center justify-center">
          <p
            className="text-8xl font-bold text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {countdown}
          </p>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex flex-col grow w-full bg-background">
      <div className="grow flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <div className="w-5 h-5 border-2 border-on-surface-variant/20 border-t-primary rounded-full animate-spin" />
          <span className="text-sm uppercase tracking-widest">Loading...</span>
        </div>
      </div>
    </div>
  );
}

// Timer display component
function TimerDisplay({
  elapsed,
  timeLimit,
  gameState,
}: {
  elapsed: number;
  timeLimit: number;
  gameState: string;
}) {
  const { secs, millis } = formatTimer(elapsed);
  const progress = Math.min(elapsed / timeLimit, 1);
  const isUrgent = progress > 0.6;
  const isCritical = progress > 0.85;

  // Color based on urgency
  const timerColor = gameState !== "ready"
    ? "text-white/30"
    : isCritical
    ? "text-red-500"
    : isUrgent
    ? "text-amber-400"
    : "text-white/80";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`flex items-baseline tabular-nums ${timerColor} transition-colors duration-300`}>
        <span
          className="text-5xl md:text-7xl font-black"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {secs}
        </span>
        <span
          className="text-5xl md:text-7xl font-black"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          :
        </span>
        <span
          className="text-5xl md:text-7xl font-black"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {millis}
        </span>
      </div>
      {/* Progress bar */}
      {gameState === "ready" && (
        <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-colors duration-300 ${
              isCritical ? "bg-red-500" : isUrgent ? "bg-amber-400" : "bg-white/40"
            }`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Scoreboard HUD component
function ScoreboardHUD({
  players,
  playerId,
  gameState,
}: {
  players: { id: string; nickname: string; score: number; connected: boolean; state: string }[];
  playerId: string | null;
  gameState: string;
}) {
  return (
    <aside className="absolute right-6 top-1/2 -translate-y-1/2 w-72 flex-col gap-3 z-30 hidden lg:flex pointer-events-none">
      <div className="bg-surface-container-lowest/20 backdrop-blur-md p-4 rounded-xl border border-white/5">
        <h3 className="text-[10px] font-black tracking-widest uppercase mb-4 opacity-70">
          Scoreboard
        </h3>
        <div className="flex flex-col gap-2">
          {players.map((p, i) => {
            const isYou = p.id === playerId;
            const playerClicked = p.state === "clicked" || p.state === "tooSoon" || p.state === "timedOut";
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isYou
                    ? "bg-surface-container-lowest border-2 border-surface-container-lowest ring-2 ring-primary-fixed/20"
                    : "bg-surface-container-lowest/30 border border-white/10"
                } ${!p.connected ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold w-5 ${
                      i === 0 ? "text-primary" : "text-on-surface-variant"
                    }`}
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    #{i + 1}
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      !p.connected
                        ? "bg-surface-container-highest"
                        : playerClicked && (gameState === "ready" || gameState === "waiting")
                        ? "bg-tertiary"
                        : isYou
                        ? "bg-primary-fixed animate-pulse"
                        : "bg-primary-fixed"
                    }`}
                  />
                  <span
                    className={`font-bold tracking-tight text-sm ${
                      isYou ? "text-primary-fixed uppercase" : ""
                    }`}
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {isYou ? "YOU" : p.nickname}
                  </span>
                </div>
                <span
                  className={`font-bold text-sm ${
                    i === 0 ? "text-primary" : "text-on-surface"
                  }`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {p.score}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
