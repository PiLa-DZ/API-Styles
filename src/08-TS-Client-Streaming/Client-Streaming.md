# Data & Streaming --> Streaming Capabilities --> Client Streaming

In **Client Streaming**,

- the relationship reverses:
  the client opens a connection
  and continuously pushes a stream
  of multiple message chunks to the server.
  The server listens patiently until the client finishes sending everything,
  and then responds with exactly _one_ summary message.

This is the perfect architectural pattern for sending large data sequences,
streaming continuous biometric/sensor metrics,
or uploading large files section-by-section
without overloading server memory buffers.

---

## Step 1: Update your Blueprint (`src/user.proto`)

Let's add a new message structure representing data packets
and add a client streaming method by placing the `stream` keyword
right before the input parameter type:

```protobuf
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

message TargetUserRequest {
  string firstName = 1;
}

// 1. Define a chunk message layout for tracking metric logs
message WorkoutMetric {
  string exerciseName = 1;
  int32 weightUsed = 2;
}

service UserService {
  rpc CreateUser(UserRequest) returns (UserResponse);
  rpc StreamUserActivities(TargetUserRequest) returns (stream UserResponse);

  // 2. The 'stream' keyword here tells gRPC that the client pushes a continuous stream
  rpc RecordWorkoutSession(stream WorkoutMetric) returns (UserResponse);
}

```

---

## Step 2: Regenerate your Code ⚡

Run your compilation script to update your generated typescript interfaces:

```bash
npm run generate

```

---

## Step 3: Implement the Client Stream Server (`src/server.ts`)

For a client stream handler,
the server doesn't get a separate request object argument.
Instead, the `call` object itself acts as a readable stream.
You listen for data using `.on("data")`
and fire your final single response through the `callback`
once the client finishes emitting via `.on("end")`.

Update your `src/server.ts` file:

```typescript
import grpc from "@grpc/grpc-js";
import { UserServiceService, type UserServiceServer } from "./user.js";

const server = new grpc.Server();

const serviceHandlers: UserServiceServer = {
  createUser: (call, callback) => {
    callback(null, { msg: "Data processed successfully! ✅" });
  },
  streamUserActivities: (call) => {
    // keeping previous implementation intact or clean
    call.end();
  },

  // Implement your new Client Streaming receiver method
  recordWorkoutSession: (call, callback) => {
    let completedSetsCount = 0;
    const trackingSummary: string[] = [];

    console.log("📥 Opened a incoming streaming channel from client...");

    // Listen to incoming chunks of workout metrics streamed by the client
    call.on("data", (metric) => {
      completedSetsCount++;
      const summaryLine = `${metric.exerciseName} at ${metric.weightUsed}kg`;
      trackingSummary.push(summaryLine);
      console.log(
        `[Chunk Received] Recorded set #${completedSetsCount}: ${summaryLine}`,
      );
    });

    // Emitted once the client finishes writing and closes its stream end
    call.on("end", () => {
      console.log("🏁 Client finished streaming metric chunks.");

      // Fire back our SINGLE unified response to close the transaction
      callback(null, {
        msg: `Session Saved successfully! Total sets processed: ${completedSetsCount}. Breakdown: [${trackingSummary.join(" | ")}]`,
      });
    });

    call.on("error", (err) => {
      console.error(`❌ Error while reading client stream: ${err.message}`);
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
    console.log(`🚀 gRPC server running with client streaming on port ${port}`);
  },
);
```

---

## Step 4: Implement the Client Stream Client (`src/client.ts`)

On the client side,
invoking a client-streaming method returns a writable stream object.
You pass a completion callback as the second argument,
and use `stream.write()` to stream payloads out before invoking `stream.end()`.

Update your `src/client.ts` file:

```typescript
import grpc from "@grpc/grpc-js";
import { UserServiceClient } from "./user.js";

const client = new UserServiceClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure(),
);

// Call the method. We supply the standard callback that fires once the server responds.
const stream = client.recordWorkoutSession((err, response) => {
  if (err) {
    console.error(`❌ Server returned error: ${err.message}`);
    return;
  }
  console.log(`🏁 Server response acknowledgment:\n${response?.msg}`);
});

console.log("🚀 Starting continuous metric streaming...");

// Stream data packets smoothly over the open pipeline
stream.write({ exerciseName: "Squat", weightUsed: 100 });
stream.write({ exerciseName: "Squat", weightUsed: 120 });
stream.write({ exerciseName: "Bench Press", weightUsed: 80 });
stream.write({ exerciseName: "Overhead Press", weightUsed: 60 });

// Tell the server we are completely done streaming data
stream.end();
```

---

```bash
# TODO: Step 1
~/Github/Backend/API-Styles (gRPC ✔) npx tsx src/Lesson-08/server.ts
🚀 gRPC server running with client streaming on port 50051

# TODO: Step 2
~/Github/Backend/API-Styles (gRPC ✔) npx tsx src/Lesson-08/client.ts
🚀 Starting continuous metric streaming...
🏁 Server response acknowledgment:
Session Saved successfully! Total sets processed: 4. Breakdown: [Squat at 100kg | Squat at 120kg | Bench Press at 80kg | Overhead Press at 60kg]

# TODO: Output from server
📥 Opened a incoming streaming channel from client...
[Chunk Received] Recorded set #1: Squat at 100kg
[Chunk Received] Recorded set #2: Squat at 120kg
[Chunk Received] Recorded set #3: Bench Press at 80kg
[Chunk Received] Recorded set #4: Overhead Press at 60kg
🏁 Client finished streaming metric chunks.
```
