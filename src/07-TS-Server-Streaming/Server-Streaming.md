# Data & Streaming --> Streaming Capabilities --> Server Streaming

In a standard Unary call,
the client sends one request
and waits for the server to send exactly one response back.
With **Server Streaming**,
the client sends _one_ request,
but the server keeps the connection open
and sends a continuous stream of multiple response messages over time.

Think of it like subscribing to a live data feed
(like a workout activity log or live system notifications).

---

## Step 1: Update your Blueprint (`src/user.proto`)

Let's add a new message type and a streaming RPC method to your service.
To tell gRPC that the server will stream responses,
we add the `stream` keyword right before the return type:

```bash
syntax = "proto3";
package UserPackage;

message UserRequest {
  string firstName = 1;
  string lastName = 2;
  int32 age = 3;
  repeated string hobbies = 4;
  map<string, string> metadata = 5;
  optional string middleName = 6;
  int64 longServerId = 7;
}

message UserResponse {
  string msg = 1;
}

// 1. Define a request payload for streaming
message TargetUserRequest {
  string firstName = 1;
}

service UserService {
  rpc CreateUser(UserRequest) returns (UserResponse);

  // 2. The 'stream' keyword here tells gRPC this returns multiple items over time
  rpc StreamUserActivities(TargetUserRequest) returns (stream UserResponse);
}

```

---

## Step 2: Regenerate your Code ⚡

Compile the changes inside your Arch terminal:

```bash
npm run generate

```

---

## Step 3: Implement the Stream Server (`src/server.ts`)

Instead of using a simple `callback(null, response)`,
a server stream gives you a `call` object that acts as a writable Node.js stream.
You use `call.write()` to push data to the client,
and `call.end()` when you are done.

Update your `src/server.ts` file:

```typescript
import grpc from "@grpc/grpc-js";
import { UserServiceService, type UserServiceServer } from "./user.js";

const server = new grpc.Server();

const serviceHandlers: UserServiceServer = {
  createUser: (call, callback) => {
    callback(null, { msg: "Data processed successfully! ✅" });
  },

  // Implement your new Server Streaming method
  streamUserActivities: (call) => {
    const { firstName } = call.request;
    console.log(`📡 Starting activity stream for user: ${firstName}`);

    const activities = [
      "Started a new bench press set",
      "Completed 12 reps of bicep curls",
      "Updated workout plan duration",
      "Finished workout session 🏋️",
    ];

    let index = 0;

    // Simulate real-time server events pushing data every 1.5 seconds
    const intervalId = setInterval(() => {
      if (index < activities.length) {
        const activity = activities[index];

        // Push a data chunk down to the client channel
        call.write({
          msg: `[Notification] ${firstName} ${activity}`,
        });

        index++;
      } else {
        // No more data to send. Close the stream pipeline gracefully.
        clearInterval(intervalId);
        call.end();
        console.log(`🏁 Stream for ${firstName} closed.`);
      }
    }, 1500);
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
    console.log(`🚀 gRPC server running with streaming on port ${port}`);
  },
);
```

---

### Step 4: Implement the Stream Client (`src/client.ts`)

On the client side,
calling a streaming method returns a readable stream object.
You listen to incoming data chunks using standard Node.js `.on('data')` event emitters.

Update your `src/client.ts` file:

```typescript
import grpc from "@grpc/grpc-js";
import { UserServiceClient } from "./user.js";

const client = new UserServiceClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure(),
);

console.log("🔗 Connecting to server activity stream...");

// Call the stream method. It returns a readable stream channel immediately.
const stream = client.streamUserActivities({ firstName: "Nabil" });

// Listen for incoming chunks from the server
stream.on("data", (response) => {
  console.log(`📥 Received from stream: ${response.msg}`);
});

// Triggers when the server executes call.end()
stream.on("end", () => {
  console.log("🛑 Stream ended by the server.");
});

// Triggers if a connection error happens
stream.on("error", (err) => {
  console.error(`❌ Stream Error: ${err.message}`);
});
```

---

```bash
# TODO: Step 1
~/Github/Backend/API-Styles (gRPC ✗) npx tsx ./src/Lesson-07/server.ts
🚀 gRPC server running with streaming on port 50051

# TODO: Step 2
~/Github/Backend/API-Styles (gRPC ✗) npx tsx ./src/Lesson-07/client.ts
🔗 Connecting to server activity stream...
📥 Received from stream: [Notification] Nabil Started a new bench press set
📥 Received from stream: [Notification] Nabil Completed 12 reps of bicep curls
📥 Received from stream: [Notification] Nabil Updated workout plan duration
📥 Received from stream: [Notification] Nabil Finished workout session 🏋️
🛑 Stream ended by the server.
~/Github/Backend/API-Styles (gRPC ✗)

# NOTE: Output: from server
📡 Starting activity stream for user: Nabil
🏁 Stream for Nabil closed.
```
