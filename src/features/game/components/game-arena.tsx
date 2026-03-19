"use client";

import { useGame } from "../hooks/use-game";
import { ReactionHistory } from "./reaction-history";

export function GameArena() {
  const { state, reactionTime, bestTime, history, handleClick } = useGame();

  return (
    <div className="flex flex-col grow w-full">
      <button
        type="button"
        onClick={handleClick}
        className={`grow flex flex-col items-center justify-center cursor-pointer select-none transition-colors duration-75 relative overflow-hidden ${
          state === "waiting"
            ? "bg-[#CC0000]"
            : state === "ready"
            ? "bg-[#00FF41]"
            : "bg-background"
        }`}
      >
        {/* Background glow for idle states */}
        {(state === "idle" || state === "clicked" || state === "tooSoon") && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="w-[600px] h-[600px] bg-primary-dim/5 blur-[120px] rounded-full" />
          </div>
        )}

        <div className="text-center select-none z-10">
          {/* IDLE */}
          {state === "idle" && (
            <>
              <p className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-4">
                System Ready
              </p>
              <h1
                className="text-[4rem] md:text-[8rem] font-extrabold tracking-tighter leading-none text-glow italic"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                CLICK TO START
              </h1>
              <p className="text-on-surface-variant text-lg tracking-[0.4em] font-bold uppercase mt-4">
                Wait for signal... React instantly
              </p>
            </>
          )}

          {/* WAITING */}
          {state === "waiting" && (
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

          {/* READY */}
          {state === "ready" && (
            <>
              <h1
                className="text-[4rem] md:text-[14rem] font-extrabold tracking-tighter leading-none italic text-surface-container-lowest drop-shadow-2xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                CLICK NOW!
              </h1>
              <p className="text-surface-container-lowest/60 text-lg tracking-[0.4em] font-bold uppercase mt-4">
                Wait for signal... React instantly
              </p>
            </>
          )}

          {/* CLICKED - Result */}
          {state === "clicked" && reactionTime !== null && (
            <>
              <div className="text-on-surface-variant text-sm font-bold uppercase tracking-[0.2em] mb-2">
                Final Reaction
              </div>
              <h1
                className="font-bold text-[6rem] md:text-[8rem] leading-none drop-shadow-[0_0_32px_rgba(156,255,147,0.2)]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {reactionTime}
                <span className="text-primary text-4xl md:text-5xl ml-2 uppercase tracking-tight">
                  ms
                </span>
              </h1>
              {bestTime !== null && (
                <div className="mt-4 flex justify-center gap-8">
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">
                      Personal Best
                    </p>
                    <p
                      className="text-2xl font-black text-primary-fixed"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {bestTime}ms
                    </p>
                  </div>
                </div>
              )}
              <p className="text-on-surface-variant text-sm tracking-[0.2em] uppercase mt-6">
                Click to try again
              </p>
            </>
          )}

          {/* TOO SOON */}
          {state === "tooSoon" && (
            <>
              <h1
                className="text-[4rem] md:text-[8rem] font-extrabold tracking-tighter leading-none italic text-error"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                TOO SOON!
              </h1>
              <p className="text-on-surface-variant text-sm tracking-[0.2em] uppercase mt-4">
                Click to try again
              </p>
            </>
          )}
        </div>

        {/* Edge texture overlays */}
        <div className="fixed inset-0 pointer-events-none border-[24px] border-surface-container-lowest/5 mix-blend-overlay" />
        {state === "ready" && (
          <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-surface-container-lowest/20 to-transparent" />
        )}
      </button>

      {/* History bar */}
      {history.length > 0 && (
        <div className="bg-surface-container-low border-t border-outline-variant/15 p-4">
          <ReactionHistory history={history} />
        </div>
      )}
    </div>
  );
}
