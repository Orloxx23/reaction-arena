import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "../src/types/socket-events";
import type { MultiplayerPlayer, Room, RoomConfig, RoundResult } from "../src/types/game";

const POINTS = [100, 80, 60, 40, 30, 20, 10, 5];

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

function generateRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

interface ServerRoom extends Room {
  roundTimer: ReturnType<typeof setTimeout> | null;
  deadlineTimer: ReturnType<typeof setTimeout> | null;
  roundDelay: number;
  goTime: number;
  clickedPlayerIds: Set<string>;
}

const rooms = new Map<string, ServerRoom>();
const playerRooms = new Map<string, string>();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    transports: ["websocket", "polling"],
  });

  function getRoom(socketId: string): ServerRoom | null {
    const roomId = playerRooms.get(socketId);
    return roomId ? rooms.get(roomId) ?? null : null;
  }

  function broadcastRoom(room: ServerRoom) {
    const publicRoom: Room = {
      id: room.id,
      hostId: room.hostId,
      players: room.players,
      config: room.config,
      currentRound: room.currentRound,
      state: room.state,
      createdAt: room.createdAt,
    };
    io.to(room.id).emit("room:updated", publicRoom);
  }

  function startRound(room: ServerRoom) {
    room.clickedPlayerIds = new Set();

    // Reset player states for the round
    for (const player of room.players) {
      if (player.connected) {
        player.state = "waiting";
        player.reactionTime = null;
      }
    }

    room.state = "waiting";
    broadcastRoom(room);
    io.to(room.id).emit("game:waiting");

    // Random delay between min and max
    const delay =
      room.config.minDelay +
      Math.random() * (room.config.maxDelay - room.config.minDelay);

    room.roundDelay = delay;

    room.roundTimer = setTimeout(() => {
      room.state = "ready";
      room.goTime = Date.now();
      broadcastRoom(room);
      io.to(room.id).emit("game:go", room.goTime);

      // Round time limit — auto-fail players who don't click in time
      room.deadlineTimer = setTimeout(() => {
        const activePlayers = room.players.filter((p) => p.connected);
        let anyAutoFailed = false;
        for (const player of activePlayers) {
          if (!room.clickedPlayerIds.has(player.id)) {
            room.clickedPlayerIds.add(player.id);
            player.state = "timedOut";
            player.reactionTime = null;
            io.to(room.id).emit("game:player-clicked", player.id, null, false, true);
            anyAutoFailed = true;
          }
        }
        if (anyAutoFailed) {
          checkRoundComplete(room);
        }
      }, room.config.roundTimeLimit);
    }, delay);
  }

  function checkRoundComplete(room: ServerRoom) {
    const activePlayers = room.players.filter((p) => p.connected);
    const allClicked = activePlayers.every(
      (p) => room.clickedPlayerIds.has(p.id)
    );

    if (!allClicked) return;

    // Cancel pending timers if round completes early
    if (room.roundTimer) {
      clearTimeout(room.roundTimer);
      room.roundTimer = null;
    }
    if (room.deadlineTimer) {
      clearTimeout(room.deadlineTimer);
      room.deadlineTimer = null;
    }

    // Process round results — rank by reaction time, award points
    const roundPlayers = activePlayers.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      reactionTime: p.reactionTime,
      tooSoon: p.state === "tooSoon",
      timedOut: p.state === "timedOut",
      pointsEarned: 0,
    }));

    // Separate valid clicks from too-soon / timed-out
    const validClicks = roundPlayers
      .filter((p) => !p.tooSoon && !p.timedOut && p.reactionTime !== null)
      .sort((a, b) => (a.reactionTime ?? Infinity) - (b.reactionTime ?? Infinity));

    // Award points by rank
    for (let i = 0; i < validClicks.length; i++) {
      validClicks[i].pointsEarned = POINTS[i] ?? 5;
    }
    // Too soon players get 0 points (already default)

    // Apply scores to room players
    for (const rp of roundPlayers) {
      const player = room.players.find((p) => p.id === rp.id);
      if (player) {
        player.score += rp.pointsEarned;
      }
    }

    room.currentRound += 1;
    room.state = "roundEnd";

    const result: RoundResult = {
      round: room.currentRound - 1,
      players: roundPlayers,
    };

    broadcastRoom(room);
    io.to(room.id).emit("game:round-end", result);

    // Check if all rounds are done
    if (room.currentRound > room.config.maxRounds) {
      // Game over — winner is highest score
      room.state = "gameOver";
      const winner = room.players
        .filter((p) => p.connected)
        .reduce((a, b) => (a.score > b.score ? a : b));

      broadcastRoom(room);
      io.to(room.id).emit("game:over", winner.id);
      return;
    }

    // Start next round after a delay
    setTimeout(() => {
      if (rooms.has(room.id) && room.state === "roundEnd") {
        startRound(room);
      }
    }, 3000);
  }

  io.on("connection", (socket) => {
    socket.on("room:create", (nickname, config, callback) => {
      let roomId: string;
      do {
        roomId = generateRoomId();
      } while (rooms.has(roomId));

      const player: MultiplayerPlayer = {
        id: socket.id!,
        nickname,
        score: 0,
        ready: false,
        reactionTime: null,
        state: "idle",
        connected: true,
      };

      const room: ServerRoom = {
        id: roomId,
        hostId: socket.id!,
        players: [player],
        config,
        currentRound: 1,
        state: "idle",
        createdAt: Date.now(),
        roundTimer: null,
        deadlineTimer: null,
        roundDelay: 0,
        goTime: 0,
        clickedPlayerIds: new Set(),
      };

      rooms.set(roomId, room);
      playerRooms.set(socket.id!, roomId);
      socket.join(roomId);

      callback(roomId);
      broadcastRoom(room);
    });

    socket.on("room:join", (roomId, nickname, callback) => {
      const room = rooms.get(roomId.toUpperCase());
      if (!room) {
        callback(false, "Room not found");
        return;
      }

      if (room.state !== "idle") {
        callback(false, "Game already in progress");
        return;
      }

      if (room.players.length >= 8) {
        callback(false, "Room is full");
        return;
      }

      const player: MultiplayerPlayer = {
        id: socket.id!,
        nickname,
        score: 0,
        ready: false,
        reactionTime: null,
        state: "idle",
        connected: true,
      };

      room.players.push(player);
      playerRooms.set(socket.id!, room.id);
      socket.join(room.id);

      callback(true);
      io.to(room.id).emit("room:player-joined", player);
      broadcastRoom(room);
    });

    socket.on("room:update-config", (configUpdate, callback) => {
      const room = getRoom(socket.id!);
      if (!room || room.hostId !== socket.id! || room.state !== "idle") {
        callback(false);
        return;
      }

      if (configUpdate.maxRounds !== undefined) {
        room.config.maxRounds = configUpdate.maxRounds;
      }
      if (configUpdate.minDelay !== undefined) {
        room.config.minDelay = configUpdate.minDelay;
      }
      if (configUpdate.maxDelay !== undefined) {
        room.config.maxDelay = configUpdate.maxDelay;
      }
      if (configUpdate.roundTimeLimit !== undefined) {
        room.config.roundTimeLimit = configUpdate.roundTimeLimit;
      }

      callback(true);
      broadcastRoom(room);
    });

    socket.on("room:leave", () => {
      // Get the room ID before handleLeave deletes the mapping
      const roomId = playerRooms.get(socket.id!);
      handleLeave(socket.id!);
      // Remove socket from the Socket.IO room so it stops receiving broadcasts
      if (roomId) {
        socket.leave(roomId);
      }
    });

    socket.on("game:start", () => {
      const room = getRoom(socket.id!);
      if (!room) return;
      if (room.hostId !== socket.id!) return;
      if (room.players.length < 2) return;
      if (room.state !== "idle") return;

      room.currentRound = 1;

      // Reset all scores
      for (const player of room.players) {
        player.score = 0;
      }

      // Countdown
      let count = 3;
      io.to(room.id).emit("game:starting", count);

      const countdownInterval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          io.to(room.id).emit("game:starting", count);
        } else {
          clearInterval(countdownInterval);
          startRound(room);
        }
      }, 1000);
    });

    socket.on("game:click", (clientReactionTime) => {
      const room = getRoom(socket.id!);
      if (!room) return;

      const player = room.players.find((p) => p.id === socket.id!);
      if (!player) return;
      if (room.clickedPlayerIds.has(socket.id!)) return;

      room.clickedPlayerIds.add(socket.id!);

      if (room.state === "waiting") {
        // Too soon
        player.state = "tooSoon";
        player.reactionTime = null;
        io.to(room.id).emit("game:player-clicked", socket.id!, null, true, false);
      } else if (room.state === "ready") {
        // Use client-reported reaction time if valid, fall back to server-side
        const serverReactionTime = Date.now() - room.goTime;
        const reactionTime =
          clientReactionTime > 0 && clientReactionTime < serverReactionTime + 500
            ? Math.round(clientReactionTime)
            : serverReactionTime;
        player.state = "clicked";
        player.reactionTime = reactionTime;
        io.to(room.id).emit("game:player-clicked", socket.id!, reactionTime, false, false);
      }

      checkRoundComplete(room);
    });

    socket.on("game:play-again", () => {
      const room = getRoom(socket.id!);
      if (!room) return;
      if (room.hostId !== socket.id!) return;
      if (room.state !== "gameOver") return;

      // Reset room to lobby state
      room.state = "idle";
      room.currentRound = 1;
      room.goTime = 0;
      room.roundDelay = 0;
      room.clickedPlayerIds = new Set();
      if (room.roundTimer) {
        clearTimeout(room.roundTimer);
        room.roundTimer = null;
      }
      if (room.deadlineTimer) {
        clearTimeout(room.deadlineTimer);
        room.deadlineTimer = null;
      }

      // Reset all connected players, remove disconnected ones
      room.players = room.players.filter((p) => p.connected);
      for (const player of room.players) {
        player.score = 0;
        player.state = "idle";
        player.reactionTime = null;
        player.ready = false;
      }

      // Transfer host if needed
      if (room.players.length > 0 && !room.players.some((p) => p.id === room.hostId)) {
        room.hostId = room.players[0].id;
      }

      broadcastRoom(room);
    });

    socket.on("disconnect", () => {
      handleLeave(socket.id!);
    });

    function handleLeave(socketId: string) {
      const room = getRoom(socketId);
      if (!room) return;

      playerRooms.delete(socketId);

      if (room.state === "idle" || room.state === "gameOver") {
        // Remove player from room
        room.players = room.players.filter((p) => p.id !== socketId);
        io.to(room.id).emit("room:player-left", socketId);

        if (room.players.length === 0) {
          if (room.roundTimer) clearTimeout(room.roundTimer);
          if (room.deadlineTimer) clearTimeout(room.deadlineTimer);
          rooms.delete(room.id);
          return;
        }

        // Transfer host if needed
        if (room.hostId === socketId) {
          room.hostId = room.players[0].id;
        }
        broadcastRoom(room);
      } else {
        // Mark as disconnected during game
        const player = room.players.find((p) => p.id === socketId);
        if (player) {
          player.connected = false;
          io.to(room.id).emit("player:disconnected", socketId);

          // If all players disconnected, clean up
          if (room.players.every((p) => !p.connected)) {
            if (room.roundTimer) clearTimeout(room.roundTimer);
            if (room.deadlineTimer) clearTimeout(room.deadlineTimer);
            rooms.delete(room.id);
            return;
          }

          // Add to clicked so round can complete
          if (!room.clickedPlayerIds.has(socketId)) {
            room.clickedPlayerIds.add(socketId);
            player.state = "tooSoon";
            player.reactionTime = null;
            checkRoundComplete(room);
          }
        }
      }
    }
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
