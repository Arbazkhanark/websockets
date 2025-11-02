import express from "express";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid"; // for generating unique message IDs

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server with CORS options
const io = new Server(server, {
  cors: {
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
    methods: ["GET", "POST"],
  },
});

// Serve static files from 'public' folder (HTML, CSS, JS)
// app.use(express.static("public"));

// Handle new client connections
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  /*** 
   * socket.data
   * Socket.IO allows storing data per socket.
   * Example:
   *   socket.data.username = "Arbaaz";
   *   socket.data.room = "room1";
   * This avoids using global variables and keeps track of each client's info.
   **/

  // -----------------------------
  // 1️⃣ Set username for this client
  // -----------------------------
  socket.on("setUsername", (username: string) => {
    socket.data.username = username; // store username for this client

    // Send welcome message only to this client
    socket.emit("system", `✅ Welcome ${username}!`);

    // Broadcast to all clients that a new user joined
    io.emit("system", `👋 ${username} joined the chat`);
  });

  // -----------------------------
  // 2️⃣ Join a room
  // -----------------------------
  socket.on("joinRoom", (roomName: string) => {
    // Leave previous room if the client is already in one
    if (socket.data.room) {
      socket.leave(socket.data.room); // inbuilt function to leave room
      socket.emit("system", `⬅️ You left ${socket.data.room}`); // notify self
    }

    // Join new room
    socket.join(roomName); // inbuilt function to join a room
    socket.data.room = roomName; // store room info in socket.data

    // Notify self
    socket.emit("system", `✅ You joined ${roomName}`);

    // Notify everyone else in the room
    socket.to(roomName).emit(
      "system",
      `👥 ${socket.data.username} joined ${roomName}`
    );
    // socket.to(room) → sends message to everyone in the room EXCEPT the sender
  });

  // -----------------------------
  // 3️⃣ Leave a room
  // -----------------------------
  socket.on("leaveRoom", () => {
    const room = socket.data.room;
    if (room) {
      socket.leave(room); // leave the room
      socket.to(room).emit(
        "system",
        `❌ ${socket.data.username} left ${room}`
      ); // notify others in room
      socket.emit("system", `⬅️ You left ${room}`); // notify self
      delete socket.data.room; // remove room info from socket
    }
  });

  // -----------------------------
  // 4️⃣ Send a message
  // -----------------------------
  socket.on("message", (msg: string, ack?: (res: string) => void) => {
    const username = socket.data.username || "Anonymous"; // fallback username
    const room = socket.data.room; // current room (undefined if global)
    const messageId = uuidv4(); // unique ID for this message

    const messageData = {
      id: messageId,
      user: username,
      text: msg,
      room: room || "global",
      type: room ? "room" : "global",
      time: new Date().toLocaleTimeString(),
      seenBy: [] as string[], // initially no one has seen the message
    };

    // Send message to the room if inside a room, else broadcast globally
    if (room) {
      io.to(room).emit("chat", messageData); // sends to everyone in room including sender
    } else {
      io.emit("chat", messageData); // global broadcast
    }

    // ACK callback to confirm delivery to sender
    if (ack) ack("✅ Message delivered");
  });

  // -----------------------------
  // 5️⃣ Message seen / read receipts
  // -----------------------------
  socket.on("messageSeen", (messageId: string, sender: string, room?: string) => {
    const username = socket.data.username || "Anonymous";

    const payload = {
      messageId,
      seenBy: username, // the user who saw the message
    };

    if (room) {
      // notify sender and other clients in the room
      socket.to(room).emit("updateSeen", payload);
    } else {
      // global chat
      socket.broadcast.emit("updateSeen", payload); 
      // broadcast → sends to all clients EXCEPT the sender
    }
  });

  // -----------------------------
  // 6️⃣ Disconnect
  // -----------------------------
  socket.on("disconnect", () => {
    const username = socket.data.username || socket.id;
    const room = socket.data.room;
    if (room) {
      socket.to(room).emit("system", `❌ ${username} left ${room}`);
    }
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// Start server
server.listen(3000, () =>
  console.log("🚀 Server running on http://localhost:3000")
);
