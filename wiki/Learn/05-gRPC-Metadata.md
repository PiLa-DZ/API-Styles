## Production Plumbing & Security --> gRPC Metadata

In a web application,
you rely on HTTP Headers
to pass authorization tokens (like `Authorization: Bearer <JWT>`),
request IDs, or tenant data.

In gRPC, we don't have standard HTTP headers
because the protocol packs everything into binary frames over HTTP/2.
Instead, gRPC provides **Metadata**.

Metadata is a collection of key-value pairs
that travels alongside your RPC payload request.
Let’s update your clean slate layout
to see how to inject a mock JWT token from the client
and validate it on the server.

---

## Step 1: Keep the Proto Simple (`src/user.proto`)

Metadata doesn't change your message payloads,
so your `.proto` file stays beautifully clean.
We'll set up a simple layout to fetch secure profile data:

```protobuf
syntax = "proto3";
package UserPackage;

message ProfileRequest {
  string userId = 1;
}

message ProfileResponse {
  string email = 1;
  string currentPlan = 2;
}

service UserService {
  rpc GetSecureProfile(ProfileRequest) returns (ProfileResponse);
}
```

Run your generation command to map the new interfaces:

```bash
npm run generate

```

---

## Step 2: Implement the Secure Server (`src/server.ts`)

On the server side, the `call` object contains a `metadata` property.
You can read incoming keys using `call.metadata.get('key_name')`.

```typescript
import grpc from "@grpc/grpc-js";
import { UserServiceService, type UserServiceServer } from "./user.js";

const server = new grpc.Server();

const serviceHandlers: UserServiceServer = {
  getSecureProfile: (call, callback) => {
    // 1. Extract metadata keys (gRPC metadata keys are ALWAYS lowercase)
    const authHeader = call.metadata.get("authorization");
    const token = authHeader[0]; // metadata.get returns an array of values

    console.log(`📡 Incoming request metadata token: ${token}`);

    // 2. Validate token presence (Basic plumbing checkpoint)
    if (!token || token !== "Bearer my-secret-workout-jwt-token") {
      return callback({
        code: grpc.status.UNAUTHENTICATED,
        message: "Invalid or missing authorization token!",
      });
    }

    // 3. Token is valid, return secure data block
    callback(null, {
      email: "nabil@example.com",
      currentPlan: "Hypertrophy Push/Pull/Legs",
    });
  },
};

server.addService(UserServiceService, serviceHandlers);

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) return console.error(err.message);
    console.log(`🚀 Secure Production Server listening on port ${port}`);
  },
);
```

---

## Step 3: Implement the Metadata Client (`src/client.ts`)

On the client side,
we instantiate a new `grpc.Metadata()` container object,
append our string attributes,
and pass it as the **second argument** right before our request callback.

```typescript
import grpc from "@grpc/grpc-js";
import { UserServiceClient } from "./user.js";

const client = new UserServiceClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure(),
);

// 1. Create a Metadata instance container
const meta = new grpc.Metadata();
meta.add("authorization", "Bearer my-secret-workout-jwt-token");
meta.add("x-request-id", "req-987654321");

console.log("🔒 Sending RPC request with secure metadata context...");

// 2. Pass the metadata instance as the second parameter block
client.getSecureProfile({ userId: "user_nabil_123" }, meta, (err, res) => {
  if (err) {
    console.error(`❌ Request Rejected [Code ${err.code}]: ${err.message}`);
    return;
  }

  console.log("✅ Secure payload decoded successfully:");
  console.log(`User Email: ${res?.email}`);
  console.log(`Active Workout Strategy: ${res?.currentPlan}`);
});
```

---

## Verify and Progress

Test your implementation by starting your server and executing your client.

To see your validation logic work actively,
try changing or removing the token string inside your `client.ts`
to watch the server safely block the context call.

```md
- [ ] Production Plumbing
  - [x] gRPC Metadata (Headers)
  - [ ] Error Handling (Status Codes)
  - [ ] Interceptors (Middleware)
```

---

```bash
# TODO: Server side
~/Github/Backend/API-Styles (gRPC ✗) npx tsx src/10-TS-gRPC-Metadata/server.ts
🚀 Secure Production Server listening on port 50051
📡 Incoming request metadata token: Bearer my-secret-workout-jwt-token
📡 Incoming request metadata token: Bearer amy-secret-workout-jwt-token

# TODO: Client side try 1
~/Github/Backend/API-Styles (gRPC ✗) npx tsx src/10-TS-gRPC-Metadata/client.ts
🔒 Sending RPC request with secure metadata context...
✅ Secure payload decoded successfully:
User Email: nabil@example.com
Active Workout Strategy: Hypertrophy Push/Pull/Legs
~/Github/Backend/API-Styles (gRPC ✗)

# TODO: Client side try 2
~/Github/Backend/API-Styles (gRPC ✗) npx tsx src/10-TS-gRPC-Metadata/client.ts
🔒 Sending RPC request with secure metadata context...
❌ Request Rejected [Code 16]: 16 UNAUTHENTICATED: Invalid or missing authorization token!
~/Github/Backend/API-Styles (gRPC ✗)
```
