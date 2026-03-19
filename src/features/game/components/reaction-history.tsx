"use client";

import type { GameResult } from "@/types/game";

interface ReactionHistoryProps {
  history: GameResult[];
}

export function ReactionHistory({ history }: ReactionHistoryProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {history.map((result, i) => (
        <div
          key={result.timestamp}
          className={`px-3 py-1.5 text-xs font-bold tabular-nums tracking-wider uppercase ${
            result.tooSoon
              ? "bg-error-container/20 text-error border border-error/15"
              : "bg-primary/8 text-primary border border-primary/10"
          } ${i === 0 ? "ring-1 ring-primary-fixed/30" : ""}`}
        >
          {result.tooSoon ? "Too soon" : `${result.reactionTime}ms`}
        </div>
      ))}
    </div>
  );
}
