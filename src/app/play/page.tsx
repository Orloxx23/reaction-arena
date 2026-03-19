"use client";

import { GameArena } from "@/features/game";
import { Header } from "@/shared/components/ui/header";

export default function PlayPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header />
      <GameArena />
    </div>
  );
}
