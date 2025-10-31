// Import necessary modules
import WebSocket,{WebSocketServer} from "ws"; // WebSocket library for Node.js
import http from 'http' // Built-in HTTP module to create server

// Create an HTTP server (WebSocket needs it for handshake)
const server = http.createServer();

// Attach WebSocket server to the HTTP server
const wss = new WebSocketServer({ server });

// Event: When a client connects
wss.on('connection', (ws) => {
  console.log('New client connected!'); // Log connection

  // Event: When message is received from client
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`); // Log the message

    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) { // Check if client is ready
        client.send(`Broadcast: ${message}`); // Send message to client
      }
    });
  });

  // Event: When client disconnects
  ws.on('close', () => {
    console.log('Client disconnected'); // Log disconnection
  });
});

// Start the server on port 8080
server.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});