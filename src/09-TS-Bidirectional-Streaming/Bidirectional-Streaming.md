# Data & Streaming --> Streaming Capabilities --> Bidirectional Streaming

In **Bidirectional Streaming**,
both the client and the server can read and write completely independent streams
of messages concurrently over a single, persistent HTTP/2 connection.

They don't have to wait for each other to finish—the pipeline stays open,
allowing simultaneous, full-duplex communication.

This is the ultimate layout for ultra-low latency features like
real-time multiplayer coordination,
collaborative documents,
or live interactive chat systems.

---

## Step 1: Clean and Reset Your Blueprint (`src/user.proto`)

Let's create a real-time chat feature between a user and a system support coach:

```protobuf
syntax = "proto3";
package UserPackage;

// 1. Structure of an individual message packet
message ChatMessage {
  string sender = 1;
  string message = 2;
}

service UserService {
  // 2. Placing 'stream' on BOTH input and output activates full-duplex bidirectional streaming
  rpc LiveCoachChat(stream ChatMessage) returns (stream ChatMessage);
}

```

---

## Step 2: Regenerate your Types ⚡

```bash
npm run generate

```

---

## Step 3: Implement the Bidirectional Server (`src/server.ts`)

For a bidirectional stream,
the handler takes just one argument: the `call` object.
It acts as both a readable stream (using `.on("data")`)
and a writable stream (using `call.write()`).
There is no end callback parameter because both ends close down independently.

```typescript
import grpc from "@grpc/grpc-js";
import { UserServiceService, type UserServiceServer } from "./user.js";

const server = new grpc.Server();

const serviceHandlers: UserServiceServer = {
  liveCoachChat: (call) => {
    console.log("⚡ [Server] Real-time bidirectional chat pipeline opened.");

    // Listen to incoming messages streaming from the client
    call.on("data", (incomingChat) => {
      console.log(
        `💬 [Received from ${incomingChat.sender}]: ${incomingChat.message}`,
      );

      // Automated system response triggered instantly over the same open pipe
      let replyMessage = "Keep pushing! Let's get those reps in! 💪";
      if (incomingChat.message.toLowerCase().includes("tired")) {
        replyMessage =
          "Take a 90-second hydration break, then finish strong! 💧";
      }

      call.write({
        sender: "AI Coach",
        message: replyMessage,
      });
    });

    // Triggers when the client stops streaming via stream.end()
    call.on("end", () => {
      console.log("🏁 [Server] Client closed their end of the chat session.");
      call.end(); // Gracefully terminate our side of the stream pipeline too
    });

    call.on("error", (err) => {
      console.error(`❌ [Server] Stream error: ${err.message}`);
    });
  },
};

server.addService(UserServiceService, serviceHandlers);

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log(`🚀 Full-Duplex Chat Server listening on port ${port}`);
  },
);
```

---

## Step 4: Implement the Bidirectional Client (`src/client.ts`)

On the client side,
calling the method returns a combined duplex stream object.
You can hook up a `.on("data")` listener to read data from the server,
and call `stream.write()` anywhere at any time to shoot data up.

```typescript
import grpc from "@grpc/grpc-js";
import { UserServiceClient } from "./user.js";

const client = new UserServiceClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure(),
);

// Open the duplex connection channel
const chatStream = client.liveCoachChat();

// 1. Listen for continuous real-time replies from the server
chatStream.on("data", (reply) => {
  console.log(`🤖 [${reply.sender} says]: ${reply.message}`);
});

chatStream.on("end", () => {
  console.log("🛑 Connection terminated by the server.");
});

chatStream.on("error", (err) => {
  console.error(`❌ Client Pipeline Error: ${err.message}`);
});

// 2. Simulate streaming out user phrases asynchronously over time
console.log("✉️ Sending initial greeting...");
chatStream.write({
  sender: "Nabil",
  message: "Hey coach! Starting my workout now.",
});

setTimeout(() => {
  console.log("✉️ Sending update packet...");
  chatStream.write({
    sender: "Nabil",
    message: "Man, I am feeling really tired on this third set.",
  });
}, 2000);

setTimeout(() => {
  console.log("✉️ Finishing up stream...");
  chatStream.write({
    sender: "Nabil",
    message: "All sets done! Closing session.",
  });
  chatStream.end(); // Let the server know we're checking out
}, 4000);
```

---

```bash
# TODO: Server side
~/Github/Backend/API-Styles (gRPC ✗) npx tsx src/Lesson-09/server.ts
🚀 Full-Duplex Chat Server listening on port 50051
⚡ [Server] Real-time bidirectional chat pipeline opened.
💬 [Received from Nabil]: Hey coach! Starting my workout now.
💬 [Received from Nabil]: Man, I am feeling really tired on this third set.
💬 [Received from Nabil]: All sets done! Closing session.
🏁 [Server] Client closed their end of the chat session.

# TODO: Client side
~/Github/Backend/API-Styles (gRPC ✗) npx tsx src/Lesson-09/client.ts
✉️ Sending initial greeting...
🤖 [AI Coach says]: Keep pushing! Let's get those reps in! 💪
✉️ Sending update packet...
🤖 [AI Coach says]: Take a 90-second hydration break, then finish strong! 💧
✉️ Finishing up stream...
🤖 [AI Coach says]: Keep pushing! Let's get those reps in! 💪
🛑 Connection terminated by the server.
~/Github/Backend/API-Styles (gRPC ✗)
```
