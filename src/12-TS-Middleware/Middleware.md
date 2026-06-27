# Production Plumbing & Security --> Interceptors (Middleware)

In Express, you use middleware functions to log requests
or validate auth tokens globally before hitting your route handlers.
In gRPC, this exact pattern is handled by **Interceptors**.

An interceptor intercepts an incoming or outgoing RPC call,
allowing you to run
shared logic,
inspect metadata,
modify requests,
or reject calls
before they reach your business logic.

---

## Step 1: Keep the Proto Consistent (`src/user.proto`)

Because interceptors wrap the execution pipeline globally,
our `.proto` file can remain simple and clean:

```protobuf
syntax = "proto3";
package UserPackage;

message LoggedRequest {
  string payload = 1;
}

message LoggedResponse {
  string result = 1;
}

service UserService {
  rpc ExecuteTask(LoggedRequest) returns (LoggedResponse);
}
```

Run your code generator script to sync the types:

```bash
npm run generate

```

---

## Step 2: Implement the Interceptor Server (`src/server.ts`)

In the Node.js `@grpc/grpc-js` library,
a server-side interceptor is a function that receives
a `ServerInterceptorArguments` object
and returns an object containing provider methods.

Let's build a global logging
and authentication interceptor in `src/server.ts`:

```typescript
import grpc from "@grpc/grpc-js";
import { UserServiceService, type UserServiceServer } from "./user.js";

// 1. Create a type-safe higher-order function wrapper for Unary handlers
function withLoggingAndAuth<Req, Res>(
  handler: grpc.handleUnaryCall<Req, Res>,
): grpc.handleUnaryCall<Req, Res> {
  return (call, callback) => {
    const startTime = Date.now();
    const path = call.getPath?.() || "Unknown Path";

    console.log(`\n==================================================`);
    console.log(`⏱️  [Interceptor] Incoming RPC: ${path}`);

    // Global Authentication Check
    const authHeader = call.metadata.get("authorization");
    const token = authHeader[0];

    if (!token || token !== "Bearer secure-production-token") {
      console.error(`🛑 [Interceptor] Auth Denied for path: ${path}`);
      return callback({
        code: grpc.status.UNAUTHENTICATED,
        message: "Global Interceptor: Access Denied. Invalid Token.",
      });
    }

    console.log(`🔑 [Interceptor] Auth Verified successfully.`);

    // Intercept the final callback response to calculate duration
    const interceptedCallback: grpc.sendUnaryData<Res> = (
      err,
      response,
      trailer,
      flags,
    ) => {
      const duration = Date.now() - startTime;
      console.log(`📈 [Interceptor] RPC ${path} resolved in ${duration}ms`);
      console.log(`==================================================`);

      // Pass the response down to the client
      callback(err, response, trailer, flags);
    };

    // Execute the actual core service handler with our intercepted callback
    handler(call, interceptedCallback);
  };
}

// 2. Initialize your server normally (no invalid interceptor options needed here)
const server = new grpc.Server();

// 3. Apply your interceptor wrapper cleanly over the handlers
const serviceHandlers: UserServiceServer = {
  executeTask: withLoggingAndAuth((call, callback) => {
    console.log(
      `🎯 [Handler] Executing core service logic for payload: "${call.request.payload}"`,
    );
    callback(null, { result: `Processed: ${call.request.payload}` });
  }),
};

server.addService(UserServiceService, serviceHandlers);

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) return console.error(err.message);
    console.log(`🚀 Middleware Interceptor Server listening on port ${port}`);
  },
);
```

---

### Step 3: Implement the Client Test (`src/client.ts`)

Let's test both the successful authentication pathway
and the global rejection pathway by updating `src/client.ts`:

```typescript
import grpc from "@grpc/grpc-js";
import { UserServiceClient } from "./user.js";

const client = new UserServiceClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure(),
);

const runTask = (tokenValue: string, label: string) => {
  const meta = new grpc.Metadata();
  meta.add("authorization", tokenValue);

  console.log(`\n📡 Dispatching Task [${label}]...`);

  client.executeTask(
    { payload: `Data packet from ${label}` },
    meta,
    (err, res) => {
      if (err) {
        console.error(
          `❌ Client Received Error [Code ${err.code}]: ${err.message}`,
        );
        return;
      }
      console.log(`✅ Client Received Success response: "${res?.result}"`);
    },
  );
};

// Test Case 1: Send valid credentials to pass through the interceptor successfully
setTimeout(() => {
  runTask("Bearer secure-production-token", "Valid Request Setup");
}, 0);

// Test Case 2: Send fake credentials to watch the interceptor block it globally
setTimeout(() => {
  runTask("Bearer fake-token-123", "Malicious Request Setup");
}, 1500);
```

---

### 🏆 You Completed the Entire Architecture Matrix

Boot up your processes and run your type checks.
You will see your middleware layer intercepts the client calls,
screens them before your actual route handler function ever runs,
and prints clean performance metrics to your terminal.

You can now check off your last milestone item:

```md
- [x] Production Plumbing & Security
  - [x] gRPC Metadata (Headers)
  - [x] Error Handling (Status Codes)
  - [x] Interceptors (Middleware)
```

You have successfully graduated from basic gRPC requests
to handling advanced native type structures,
building complex high-throughput streaming systems,
and securing them using industry-standard enterprise pipelines! Excellent work.

---

```bash

# TODO: Server side
~/Github/Backend/API-Styles (gRPC ✔) npx tsx src/12-TS-Middleware/server.ts
🚀 Middleware Interceptor Server listening on port 50051

==================================================
⏱️  [Interceptor] Incoming RPC: /UserPackage.UserService/ExecuteTask
🔑 [Interceptor] Auth Verified successfully.
🎯 [Handler] Executing core service logic for payload: "Data packet from Valid Request Setup"
📈 [Interceptor] RPC /UserPackage.UserService/ExecuteTask resolved in 1ms
==================================================

==================================================
⏱️  [Interceptor] Incoming RPC: /UserPackage.UserService/ExecuteTask
🛑 [Interceptor] Auth Denied for path: /UserPackage.UserService/ExecuteTask

# TODO: Client side
~/Github/Backend/API-Styles (gRPC ✗) npx tsx src/12-TS-Middleware/client.ts

📡 Dispatching Task [Valid Request Setup]...
✅ Client Received Success response: "Processed: Data packet from Valid Request Setup"

📡 Dispatching Task [Malicious Request Setup]...
❌ Client Received Error [Code 16]: 16 UNAUTHENTICATED: Global Interceptor: Access Denied. Invalid Token.
~/Github/Backend/API-Styles (gRPC ✗)
```
