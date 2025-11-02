# Socket.IO Chat App with Rooms, Global Chat, and Read Receipts

This is a **real-time chat application** built with **Node.js** and **Socket.IO**, supporting:

- Usernames
- Private rooms (Room 1, Room 2)
- Global chat
- Real-time messages with **read receipts ("seen by")**
- System notifications (join/leave)
- ACK callbacks for message delivery

---

## Table of Contents

1. [Running the App](#running-the-app)  
2. [Frontend Structure](#frontend-structure)  
3. [Backend Structure](#backend-structure)  
4. [Key Socket.IO Concepts](#key-socketio-concepts)  
5. [Detailed Flow Examples](#detailed-flow-examples)  
6. [Conclusion](#conclusion)  

---

## Running the App

1. Enter a username
2. Join Room 1, Room 2, or switch to Global Chat
3. Send messages
4. Messages in rooms are visible only to members of that room
5. Messages in global chat are visible to everyone
6. Messages show read receipts automatically when other users see your message

---

## Frontend Structure

- `index.html` — Main HTML page with username input, chat box, rooms, and message input
- CSS is included inline (you can separate it to `style.css`)
- JavaScript uses **Socket.IO client** to send/receive messages

---

## Backend Structure

- `index.js` — Node.js + Express server
- Uses `socket.io` for real-time communication
- Handles:
  - `setUsername`
  - `joinRoom`
  - `leaveRoom`
  - `message` with ACK
  - `messageSeen` to update read receipts
- `socket.data` is used to store per-client data like `username` and `room`

---

## Basic Understanding:- 

| Feature                         | What it does                                      | Example in your code                      |
| ------------------------------- | ------------------------------------------------- | ----------------------------------------- |
| `socket.emit`                   | Sends a message **only to this client**           | `socket.emit("system", ...)`              |
| `io.emit`                       | Sends a message **to all connected clients**      | `io.emit("system", ...)`                  |
| `socket.join(roomName)`         | Join a room (private group chat)                  | `socket.join("room1")`                    |
| `socket.leave(roomName)`        | Leave a room                                      | `socket.leave(socket.data.room)`          |
| `socket.to(roomName).emit(...)` | Send to everyone in the room **except sender**    | `socket.to(roomName).emit("system", ...)` |
| `io.to(roomName).emit(...)`     | Send to everyone in the room **including sender** | `io.to(room).emit("chat", messageData)`   |
| `socket.data`                   | Per-socket storage for username/room/etc          | `socket.data.username = "Arbaaz"`         |
| `ACK callback`                  | Confirms to sender that message delivered         | `if (ack) ack("✅ Message delivered")`     |
| `uuidv4()`                      | Generates unique message IDs for read receipts    | `const messageId = uuidv4()`              |



---- 

## Key Socket.IO Concepts

### 1. `socket.emit`

Sends a message **to this specific client only**.

Example:

```javascript
socket.emit("system", `✅ Welcome ${username}!`);
```

Explanation:
The Welcome message goes only to the client who just connected.


2. io.emit

Sends a message to all connected clients.

Example:

```javascript
io.emit("system", `👋 ${username} joined the chat`);
```

Explanation:
All users will see a system message when a new user joins.


3. socket.join(roomName)

Adds a socket to a room, which is like a private group chat.

Example:
```javascript
socket.join("room1");
```

Explanation:
After joining, you can send messages to only that room using io.to(roomName).emit(...).




4. socket.leave(roomName)

Removes a socket from a room.

Example:

```javascript
socket.leave(socket.data.room);
socket.emit("system", `⬅️ You left ${socket.data.room}`);
```

Explanation:
The client leaves the room and receives a system message confirming it.


5. socket.to(room).emit(...)

Sends a message to everyone in a room except the sender.

Example:
```javascript
socket.to(roomName).emit(
  "system",
  `👥 ${socket.data.username} joined ${roomName}`
);
```


Explanation:
Everyone in the room (except the one who joined) gets a notification that someone joined.



6. io.to(room).emit(...)

Sends a message to everyone in a room, including sender.

Example:
```js
if (room) {
  io.to(room).emit("chat", messageData);
} else {
  io.emit("chat", messageData);
}
```


Explanation:

 1.If the sender is in a room → broadcast to the whole room
 2.Otherwise → broadcast globally to all connected users


7. socket.data

Socket.IO allows per-socket storage with socket.data.
We store:
```js
socket.data.username = "Arbaaz";
socket.data.room = "room1";
```

Explanation:
Every socket has its own data object.
This avoids global variables and lets you track username and room per connection.



8. ACK Callbacks

You can confirm the delivery of a message with a callback function:
```js
socket.emit("message", msg, (ack) => {
  addSystemMessage(`✔️ ${ack}`);
});


Server sends the ACK:

if (ack) ack("Message delivered");
```

Explanation:
This confirms to the client that the server received the message.





9. Read Receipts / Seen

When a user sees a message:
```js
socket.emit("messageSeen", messageId, senderUsername, currentRoom);
```

Server broadcasts updated seen info:
```js
socket.to(currentRoom).emit("updateSeen", { messageId, seenBy: socket.data.username });
```

Clients update UI to show:
```text
👁️ Seen by: user1, user2
```




## Detailed Flow Examples
### Joining a Room

```js
socket.on("joinRoom", (roomName) => {
  if (socket.data.room) socket.leave(socket.data.room); // leave old room
  socket.join(roomName); // join new room
  socket.data.room = roomName; // store room name

  socket.emit("system", `✅ You joined ${roomName}`); // to self
  socket.to(roomName).emit("system", `👥 ${socket.data.username} joined ${roomName}`); // to others
});
```

Flow:
  1. Leave old room if any
  2. Join new room
  3. Notify sender 
  4. Notify others in the room


---

## Sending Messages
```js
socket.on("message", (msg, ack) => {
  const room = socket.data.room;
  const messageData = { user: socket.data.username, text: msg, type: room ? "room" : "global" };

  if (room) io.to(room).emit("chat", messageData); // room message
  else io.emit("chat", messageData); // global message

  if (ack) ack("Message delivered"); // ACK callback
});
```

Explanation:

  1. Messages inside a room → only room members

  2. Global messages → everyone connected

  3. ACK → confirms delivery



---

Leaving a Room
```js
socket.on("leaveRoom", () => {
  const room = socket.data.room;
  if (room) {
    socket.leave(room); // remove from room
    socket.to(room).emit("system", `❌ ${socket.data.username} left ${room}`);
    socket.emit("system", `⬅️ You left ${room}`);
    delete socket.data.room;
  }
});
```

Explanation:

  1. The user leaves the room

  2. Notify others in that room

  3. Notify self



---

## Read Receipt Example
```js
socket.emit("messageSeen", messageId, senderUsername, currentRoom);
socket.to(currentRoom).emit("updateSeen", { messageId, seenBy: socket.data.username });
```

Explanation:
When a user sees a message, the server informs the original sender and others in the room.

----



## Conclusion

### This chat app demonstrates:

Socket.IO core concepts: emit, io.emit, socket.to, socket.join, socket.leave, socket.data

Rooms vs global chat

ACK callbacks for delivery

Read receipts

Real-time updates with system notifications

This structure is highly scalable for building WhatsApp/Telegram-like chat apps.