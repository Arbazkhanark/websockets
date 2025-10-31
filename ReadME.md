<!-- # 🚀 Phase-1: WebSocket Fundamentals


# 🌐 WebSocket Fundamentals — Phase 1
Real-time communication using Node.js and WebSocket (`ws`).


## 🎯 Goal
Is phase ka main goal hai **WebSocket** ko samajhna — ye kya hota hai, kaise kaam karta hai, aur kaise hum ek simple **Node.js WebSocket server** bana sakte hain.  
Is phase mein hum **WebSocket vs HTTP**, **handshake process**, **native API**, aur ek **basic echo server** banayenge using the `ws` library.

---

## 🧠 Topic 1: WebSocket vs HTTP

### 🌐 What is WebSocket?
**WebSocket** ek protocol hai jo **browser** aur **server** ke beech ek *persistent (lagatar khula)* connection banata hai.  
Yeh **full-duplex** hota hai — matlab client aur server dono ek saath data send/receive kar sakte hain **bina baar-baar request bheje**.

**Use cases:**
- Real-time chat apps 💬  
- Multiplayer games 🎮  
- Stock price updates 📊  
- Live notifications 🔔  


---

## 🧩 Main WebSocket Events

| Event | Description |
|--------|-------------|
| `onopen` | Connection successful |
| `onmessage` | Data received from server |
| `onclose` | Disconnected from server |
| `onerror` | Some error occurred |
| `send()` | Send message to the server |

---



### ⚙️ How WebSocket Differs from HTTP
| Feature | HTTP | WebSocket |
|----------|------|-----------|
| Connection Type | Request-Response | Persistent (Full-Duplex) |
| Communication | One-way per request | Two-way (real-time) |
| Overhead | High (headers every time) | Low |
| Latency | Higher | Much lower |
| Ideal For | Static websites | Real-time apps |

**🧩 Example:**
- HTTP: Client → Server (request), Server → Client (response), then disconnect.  
- WebSocket: Client ↔ Server (open channel), data can flow anytime.

**✅ Fayda:**  
WebSocket mein **overhead kam** hota hai aur **latency low**, isliye real-time apps ke liye perfect hai.

---

## 🔄 Topic 2: WebSocket Handshake

**Handshake** ek initial step hota hai jisme connection **HTTP se WebSocket** mein upgrade hota hai.

1. **Client** ek normal HTTP request bhejta hai with this header:
```
Upgrade: websocket
Connection: Upgrade
```

2. **Server response:**
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
```





3. Ab se connection WebSocket pe switch ho jaata hai.

---

## 💻 Topic 3: Native WebSocket API (Browser Side)

Browsers already WebSocket support karte hain.

```javascript
const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => console.log("✅ Connected!");
socket.onmessage = (event) => console.log("📩 Message:", event.data);
socket.onclose = () => console.log("❌ Disconnected");
socket.onerror = (error) => console.error("⚠️ Error:", error);

socket.send("Hello from client!");
```




## ⚙️ Topic 4: Basic WebSocket Server (Node.js + ws Library)

### 🧾 Step 1: Project Setup

```bash
mkdir websocket-fundamentals
cd websocket-fundamentals
npm init -y
npm install ws
```


### 🧠 Step 2: Backend Code (server.js)

```javascript
// Import necessary modules
import WebSocket, { WebSocketServer } from "ws"; // WebSocket library for Node.js
import http from "http"; // Built-in HTTP module to create server

// Create an HTTP server (WebSocket uses this for handshake)
const server = http.createServer();

// Attach WebSocket server to the HTTP server
const wss = new WebSocketServer({ server });

// Event: When a client connects
wss.on("connection", (ws) => {
  console.log("🟢 New client connected!");

  // Event: When a message is received from client
  ws.on("message", (message) => {
    console.log(`📨 Received: ${message}`);

    // Broadcast message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`🔁 Broadcast: ${message}`);
      }
    });
  });

  // Event: When client disconnects
  ws.on("close", () => {
    console.log("🔴 Client disconnected");
  });
});

// Start server
server.listen(8080, () => {
  console.log("🚀 Server is running on http://localhost:8080");
});
```

### 🧠 Step 3: Frontend Code (index.html)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>WebSocket Basics</title>
  </head>
  <body>
    <input id="message" placeholder="Type a message" />
    <button onclick="sendMessage()">Send</button>
    <div id="output"></div>

    <script>
      // Create WebSocket connection
      const ws = new WebSocket("ws://localhost:8080");

      ws.onopen = () => {
        console.log("Connected to server");
        document.getElementById("output").innerHTML += "<p>✅ Connected!</p>";
      };

      ws.onmessage = (event) => {
        document.getElementById("output").innerHTML += `<p>${event.data}</p>`;
      };

      ws.onclose = () => {
        console.log("Disconnected");
        document.getElementById("output").innerHTML += "<p>❌ Disconnected!</p>";
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      function sendMessage() {
        const msg = document.getElementById("message").value;
        ws.send(msg);
        document.getElementById("message").value = "";
      }
    </script>
  </body>
</html>
```


## ▶️ Step 4: Run & Test

### 🖥️ Start the Server
```bash
node server.js
```



## 🌍 Open in Browser

1. Open **`index.html`** in your browser.  
2. Open **multiple tabs** to test communication.  
3. Send a message from one tab — it will **broadcast** to all connected tabs ✅

---

## ♻️ Bonus: Auto Reconnect Logic

Add this snippet to automatically reconnect the client if the connection drops:

```javascript
function connect() {
  let ws = new WebSocket("ws://localhost:8080");

  ws.onopen = () => console.log("✅ Connected!");
  ws.onmessage = (event) => console.log("📩", event.data);

  ws.onclose = () => {
    console.log("⚠️ Disconnected... retrying in 1s");
    setTimeout(connect, 1000); // Retry after 1 second
  };
}

connect();

```


## 🧩 Flow Summary

**Handshake → Connect → Send/Receive → Close**

---

### 🔁 Lifecycle

- Client connects → `onopen`  
- Message sent → `send()`  
- Server receives → broadcasts  
- Clients receive → `onmessage`  
- Client disconnects → `onclose`

---

## ✅ Key Takeaways

- **WebSocket** = Real-time, two-way communication  
- **HTTP** → Request-Response (temporary)  
- **WebSocket** → Persistent connection  
- **Handshake** converts HTTP → WebSocket  
- Perfect for **chat apps**, **games**, **live dashboards**  
- `ws` is the most popular Node.js WebSocket library  

---

## 📚 Next Steps

👉 **Phase 2:** Integrate WebSocket with **Express.js** to handle real chat events and routes.

---

## 👨‍💻 Author

| Info | Details |
|------|----------|
| 🧑‍💻 **Name** | Arbaaz Khan |
| 📅 **Phase** | 1 — WebSocket Fundamentals |
| 🧩 **Tools Used** | Node.js, ws, HTML, JavaScript |
| 📘 **Status** | ✅ Completed and Ready for Practice |

---

## 🗂️ Repository Structure

```bash
websocket-fundamentals/
├── index.html
├── server.js
├── package.json
└── README.md
```



---

## 🌟 Support

If this helped you understand **WebSockets** better,  
don’t forget to ⭐ the repo and share it with your developer friends! -->























# 🚀 Phase 1: WebSocket Fundamentals

# 🌐 WebSocket Fundamentals — Phase 1
Learn how to build real-time communication using **Node.js** and **WebSocket (`ws`)**.

---

## 🎯 Goal

The main goal of this phase is to **understand what WebSocket is**, **how it works**, and **how to build a basic WebSocket server** using Node.js.

In this phase, you will learn:

- What is WebSocket  
- Difference between WebSocket and HTTP  
- How the **handshake process** works  
- How to use the **WebSocket API in browsers**  
- How to create a **Node.js WebSocket server** using the `ws` library  

---

## 🧠 Topic 1: WebSocket vs HTTP

### 🌐 What is WebSocket?

**WebSocket** is a communication protocol that creates a **persistent connection** between a **browser** and a **server**.

Unlike HTTP, WebSocket allows **both client and server** to send messages **anytime** without sending a new request each time.

### 💡 In Simple Words:
Once the connection is open, both sides can chat freely without knocking on the door (sending new requests).

---

### ⚙️ Use Cases

- Real-time chat apps 💬  
- Multiplayer games 🎮  
- Stock price updates 📊  
- Live notifications 🔔  
- Live dashboards 📈  

---

### ⚙️ WebSocket vs HTTP Comparison

| Feature | HTTP | WebSocket |
|----------|------|-----------|
| Connection | Request-Response (temporary) | Persistent (always open) |
| Communication | One-way per request | Two-way (real-time) |
| Overhead | High (headers on every request) | Low |
| Latency | Higher | Much lower |
| Best For | Static or normal websites | Real-time applications |

---

### 🧩 Example

- **HTTP:** Client → sends request → Server → sends response → connection closed.  
- **WebSocket:** Client ↔ Server → connection stays open and both can send/receive messages anytime.

✅ **Benefit:** Less delay (low latency) and faster communication — perfect for live apps!

---

## 🔄 Topic 2: WebSocket Handshake

Before communication starts, the browser and server perform a small handshake.

### Step 1: Client Request
The browser sends a normal HTTP request to upgrade the connection:

```bash
Upgrade: websocket
Connection: Upgrade
```



### Step 2: Server Response
The server accepts it and upgrades to WebSocket:
```bash 
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade 
```


After this, the connection switches to WebSocket and stays open.

---

## 💻 Topic 3: Native WebSocket API (Browser Side)

All modern browsers support WebSocket.

Example code in JavaScript 👇

```javascript
const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => console.log("✅ Connected!");
socket.onmessage = (event) => console.log("📩 Message:", event.data);
socket.onclose = () => console.log("❌ Disconnected");
socket.onerror = (error) => console.error("⚠️ Error:", error);

socket.send("Hello from client!");
```

---

## 🧩 Main WebSocket Events

| Event | Description |
|--------|-------------|
| `onopen` | Connection successful |
| `onmessage` | Data received from server |
| `onclose` | Disconnected from server |
| `onerror` | Some error occurred |
| `send()` | Send message to the server |

---



### ⚙️ Topic 4: Basic WebSocket Server (Node.js + ws Library)

## 🧾 Step 1: Project Setup

```bash
mkdir websocket-fundamentals
cd websocket-fundamentals
npm init -y
npm install ws

```


## 🧠 Step 2: Backend Code (server.js)

```javascript
import WebSocket, { WebSocketServer } from "ws";
import http from "http";

// Create an HTTP server (used by WebSocket for handshake)
const server = http.createServer();

// Attach WebSocket server to the HTTP server
const wss = new WebSocketServer({ server });

// Event: When a client connects
wss.on("connection", (ws) => {
  console.log("🟢 New client connected!");

  // When client sends a message
  ws.on("message", (message) => {
    console.log(`📨 Received: ${message}`);

    // Broadcast message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`🔁 Broadcast: ${message}`);
      }
    });
  });

  // When client disconnects
  ws.on("close", () => {
    console.log("🔴 Client disconnected");
  });
});

// Start server
server.listen(8080, () => {
  console.log("🚀 Server running on http://localhost:8080");
});
```

## 🧠 Step 3: Frontend Code (index.html)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>WebSocket Basics</title>
  </head>
  <body>
    <input id="message" placeholder="Type a message" />
    <button onclick="sendMessage()">Send</button>
    <div id="output"></div>

    <script>
      const ws = new WebSocket("ws://localhost:8080");

      ws.onopen = () => {
        document.getElementById("output").innerHTML += "<p>✅ Connected!</p>";
      };

      ws.onmessage = (event) => {
        document.getElementById("output").innerHTML += `<p>${event.data}</p>`;
      };

      ws.onclose = () => {
        document.getElementById("output").innerHTML += "<p>❌ Disconnected!</p>";
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      function sendMessage() {
        const msg = document.getElementById("message").value;
        ws.send(msg);
        document.getElementById("message").value = "";
      }
    </script>
  </body>
</html>
```

-----
## ▶️ Step 4: Run & Test
🖥️ Start the Server
```bash
node server.js
```




## 🌍 Open in Browser

1. Open **`index.html`** in your browser.
2. Open **multiple tabs** to test communication.
3. Send a message from one tab — it will appear on all tabs! ✅

---

## ♻️ Bonus: Auto Reconnect Logic

If the server closes or connection drops, this script will automatically reconnect the client:

```javascript
function connect() {
  let ws = new WebSocket("ws://localhost:8080");

  ws.onopen = () => console.log("✅ Connected!");
  ws.onmessage = (event) => console.log("📩", event.data);

  ws.onclose = () => {
    console.log("⚠️ Disconnected... reconnecting in 1s");
    setTimeout(connect, 1000);
  };
}

connect();
```





## 🧩 Flow Summary

**Handshake → Connect → Send/Receive → Close**

---

### 🔁 Lifecycle

- Client connects → `onopen`  
- Message sent → `send()`  
- Server receives → broadcasts  
- Clients receive → `onmessage`  
- Client disconnects → `onclose`

---

## ✅ Key Takeaways

- WebSocket enables **real-time, two-way communication**  
- HTTP closes after every request; WebSocket stays **open**  
- Handshake converts **HTTP → WebSocket**  
- Perfect for **chat apps**, **games**, **notifications**, **dashboards**  
- The `ws` library is the most popular Node.js WebSocket package  

---

## 📚 Next Steps

👉 **Phase 2:** Combine WebSocket with **Express.js** to create real chat features and event handling.

---

## 👨‍💻 Author

| Info | Details |
|------|---------|
| 🧑‍💻 **Name** | Arbaaz Khan |
| 📅 **Phase** | 1 — WebSocket Fundamentals |
| 🧩 **Tools Used** | Node.js, ws, HTML, JavaScript |
| 📘 **Status** | ✅ Completed and Ready for Practice |

---

## 🗂️ Repository Structure

```bash
websocket-fundamentals/
├── client/index.html
├── server/src/server.js
├── .gitignore
└── README.md
```


## 🌟 Support

If this project helped you understand **WebSockets**,  
please ⭐ the repo and share it with your developer friends! 💙
