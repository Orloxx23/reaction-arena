"use client";

import { useMultiplayer } from "../hooks/use-multiplayer";
import { NicknameForm } from "./nickname-form";
import { RoomLobby } from "./room-lobby";
import { WaitingRoom } from "./waiting-room";
import { MultiplayerArena } from "./multiplayer-arena";

export function MultiplayerGame() {
  const mp = useMultiplayer();

  // Step 1: Enter nickname
  if (!mp.nickname) {
    return (
      <main className="relative min-h-[calc(100dvh-60px)] flex items-center justify-center pt-20 pb-24 px-4 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-error-container rounded-full blur-[128px]" />
        </div>

        {/* Modal overlay */}
        <div className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <NicknameForm
            onSubmit={(name) => {
              mp.setNickname(name);
              mp.connect();
            }}
          />
        </div>

        {/* Blurred background cards placeholder */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 grayscale pointer-events-none">
          <div className="bg-surface-container-low p-6 h-64 border border-outline-variant/10 rounded-lg" />
          <div className="bg-surface-container-low p-6 h-64 border border-outline-variant/10 rounded-lg" />
          <div className="bg-surface-container-low p-6 h-64 border border-outline-variant/10 rounded-lg" />
        </div>
      </main>
    );
  }

  // Step 2: Create or join room
  if (!mp.room) {
    return (
      <main className="grow flex flex-col items-center justify-center px-4 relative overflow-hidden bg-mesh">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="w-[600px] h-[600px] bg-primary-dim/5 blur-[120px] rounded-full" />
        </div>
        <div className="flex flex-col items-center gap-6 z-10">
          <p className="text-sm text-on-surface-variant tracking-widest uppercase">
            Playing as{" "}
            <span
              className="text-primary-fixed font-bold uppercase tracking-wider"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {mp.nickname}
            </span>
          </p>
          <RoomLobby
            onCreate={() => mp.createRoom()}
            onJoin={mp.joinRoom}
            error={mp.error}
          />
        </div>
      </main>
    );
  }

  // Step 3: Waiting room (game not started, and no countdown active)
  if (mp.room.state === "idle" && mp.countdown === null) {
    return (
      <main className="grow pt-20 pb-28 px-4 md:px-12 kinetic-bg overflow-auto">
        <WaitingRoom
          room={mp.room}
          playerId={mp.playerId}
          isHost={mp.isHost()}
          onStart={mp.startGame}
          onLeave={mp.leaveRoom}
          onUpdateConfig={mp.updateConfig}
        />
      </main>
    );
  }

  // Step 4: Active game (includes countdown, waiting, ready, roundEnd, gameOver)
  return (
    <MultiplayerArena
      onPlayAgain={mp.playAgain}
      onLeave={mp.leaveRoom}
    />
  );
}
