"use client";

import { MultiplayerGame } from "@/features/multiplayer";
import { Header } from "@/shared/components/ui/header";

export default function MultiplayerPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header />
      <MultiplayerGame />
    </div>
  );
}
