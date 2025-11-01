// Import required modules
import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid"; // For generating unique client IDs

// Initialize Express app
const app = express();

// Serve static files (like your HTML file) from "public" folder
app.use(express.static("public"));

// Create a raw HTTP server and attach Express to it
const server = http.createServer(app);

// Create a WebSocket server using the same HTTP server
const wss = new WebSocketServer({ server });

// ✅ Interface for our connected clients
interface Client {
  id: string;         // unique ID for each connected client
  socket: WebSocket;  // WebSocket connection instance
}

// Store all active clients here
const clients: Client[] = [];

// When a client connects to WebSocket server
wss.on("connection", (ws) => {
  const clientId = uuidv4(); // Generate unique ID for this client
  const client: Client = { id: clientId, socket: ws };

  // Add new client to our list
  clients.push(client);

  console.log(`🟢 New client connected: ${clientId}`);
  console.log("All connected clients:", clients.map((c) => c.id));

  // Listen for messages from the client
  ws.on("message", (message) => {
    console.log(`📩 Received from ${clientId}: ${message}`);

    // Broadcast message to all connected clients
    clients.forEach((c) => {
      if (c.socket.readyState === WebSocket.OPEN) {
        c.socket.send(`Broadcast from ${clientId}: ${message}`);
      }
    });
  });

  // When client disconnects
  ws.on("close", () => {
    console.log(`🔴 Client disconnected: ${clientId}`);
    // Remove client from the list
    const index = clients.findIndex((c) => c.id === clientId);
    if (index !== -1) clients.splice(index, 1);
  });
});

// Start the HTTP + WebSocket server
server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
