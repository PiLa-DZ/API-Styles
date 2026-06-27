# Production Plumbing & Security --> Error Handling (Status Codes)

In a traditional REST API, you signal failure using HTTP status codes
like `404 Not Found`, `400 Bad Request`, or `500 Internal Server Error`.
In gRPC, because everything is running over a binary HTTP/2 stream channel,
**HTTP status codes are completely hidden**.

Instead, gRPC uses a strict set of **16 standardized status codes**
built directly into the protocol core.

Let’s update your project codebase to see how to properly return these codes
from your service handlers and read them cleanly inside your client code
without crashing your server process.

---

## Step 1: Keep the Proto Consistent (`src/user.proto`)

Your proto schema remains clean since errors travel through
the gRPC status layer rather than your successful return payloads:

```protobuf
syntax = "proto3";
package UserPackage;

message WorkoutRequest {
  string workoutId = 1;
}

message WorkoutResponse {
  string title = 1;
  int32 targetSets = 2;
}

service UserService {
  rpc GetWorkoutDetails(WorkoutRequest) returns (WorkoutResponse);
}

```

Run your generation command to ensure types match perfectly:

```bash
npm run generate

```

---

## Step 2: Implement the Error-Aware Server (`src/server.ts`)

To return an error in gRPC,
you pass an error object as the **first argument** of your `callback`.
This object requires a specific `code` property
(using the enum values inside `grpc.status`)
and a descriptive text `message`.

```typescript
import grpc from "@grpc/grpc-js";
import { UserServiceService, type UserServiceServer } from "./user.js";

const server = new grpc.Server();

// Mock database collection
const workoutDatabase: Record<string, { title: string; targetSets: number }> = {
  workout_01: { title: "Heavy Push Day (Chest/Triceps)", targetSets: 16 },
  workout_02: { title: "Leg Hypertrophy Focus", targetSets: 20 },
};

const serviceHandlers: UserServiceServer = {
  getWorkoutDetails: (call, callback) => {
    const { workoutId } = call.request;

    console.log(`🔍 Searching database for workout ID: "${workoutId}"`);

    // 1. Validation Error: Check if the string parameter format is valid
    if (!workoutId.startsWith("workout_")) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Malformed input format. ID must begin with prefix 'workout_'",
      });
    }

    const workout = workoutDatabase[workoutId];

    // 2. Resource Missing Error: Check if data exists in memory
    if (!workout) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: `No workout record found matching the ID: '${workoutId}'`,
      });
    }

    // 3. Success condition
    callback(null, workout);
  },
};

server.addService(UserServiceService, serviceHandlers);

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) return console.error(err.message);
    console.log(`🚀 Error Handling Lab Server listening on port ${port}`);
  },
);
```

---

## Step 3: Implement the Fault-Tolerant Client (`src/client.ts`)

On the client side,
if an error happens, the `err` object inside the callback is populated.
You can read `err.code` to safely route your application logic.

```typescript
import grpc from "@grpc/grpc-js";
import { UserServiceClient } from "./user.js";

const client = new UserServiceClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure(),
);

// Helper utility function to make testing quick and easy
const fetchWorkout = (id: string) => {
  console.log(`\n📡 Requesting ID: "${id}"...`);

  client.getWorkoutDetails({ workoutId: id }, (err, res) => {
    if (err) {
      // Handle known protocol status codes
      if (err.code === grpc.status.INVALID_ARGUMENT) {
        console.error(`❌ [Bad Request - Code ${err.code}]: ${err.message}`);
      } else if (err.code === grpc.status.NOT_FOUND) {
        console.error(`❌ [Not Found - Code ${err.code}]: ${err.message}`);
      } else {
        console.error(
          `❌ [Unexpected Error - Code ${err.code}]: ${err.message}`,
        );
      }
      return;
    }

    console.log(
      `✅ Success! Routine: "${res?.title}" (${res?.targetSets} working sets)`,
    );
  });
};

// Test Case 1: Fire a perfectly valid execution pathway
setTimeout(() => fetchWorkout("workout_01"), 0);

// Test Case 2: Fire an invalid input format block to trigger INVALID_ARGUMENT (3)
setTimeout(() => fetchWorkout("invalid-id-format-123"), 1000);

// Test Case 3: Fire a missing resource pathway to trigger NOT_FOUND (5)
setTimeout(() => fetchWorkout("workout_999"), 2000);
```

---

### Check off your Progress

Run your server and your client scripts.
You will watch your client capture and log clean,
structural errors with precision timestamps without a single application crashing!

Once your compiler check passes with zero warnings,
you can check off this milestone:

```md
- [ ] Production Plumbing & Security
  - [x] gRPC Metadata (Headers)
  - [x] Error Handling (Status Codes)
  - [ ] Interceptors (Middleware)
```

---

```bash

# TODO: Server side
~/Github/Backend/API-Styles (gRPC ✗) npx tsx src/11-TS-Error-Handling/server.ts
🚀 Error Handling Lab Server listening on port 50051
🔍 Searching database for workout ID: "workout_01"
🔍 Searching database for workout ID: "invalid-id-format-123"
🔍 Searching database for workout ID: "workout_999"

# TODO: Client side
~/Github/Backend/API-Styles (gRPC ✗) npx tsx src/11-TS-Error-Handling/client.ts

📡 Requesting ID: "workout_01"...
✅ Success! Routine: "Heavy Push Day (Chest/Triceps)" (16 working sets)

📡 Requesting ID: "invalid-id-format-123"...
❌ [Bad Request - Code 3]: 3 INVALID_ARGUMENT: Malformed input format. ID must begin with prefix 'workout_'

📡 Requesting ID: "workout_999"...
❌ [Not Found - Code 5]: 5 NOT_FOUND: No workout record found matching the ID: 'workout_999'
~/Github/Backend/API-Styles (gRPC ✗)
```
