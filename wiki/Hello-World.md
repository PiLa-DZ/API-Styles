# Step 1: The Contract Blueprint (`src/Lesson-04/hello.proto`)

```protobuf
syntax = "proto3";

package hello;

message HelloRequest {
  string name = 1;
}

message HelloResponse {
  string greeting = 1;
}

service HelloService {
  rpc SayHello (HelloRequest) returns (HelloResponse);
}

```

---

## Step 2: The Bare Minimum Server (`src/Lesson-04/server.ts`)

- Loading the file
- Adding the service
- Turning it on

```typescript
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { join } from "node:path";

// 1. Load our proto file blueprint
const PROTO_PATH = join(process.cwd(), "src/Lesson-04/hello.proto");
const packageDef = protoLoader.loadSync(PROTO_PATH);
const helloPkg = grpc.loadPackageDefinition(packageDef).hello as any;

// 2. Create the server container
const server = new grpc.Server();

// 3. Add our service handler function (Remember: inputs and outputs must be objects!)
server.addService(helloPkg.HelloService.service, {
  SayHello: (call: any, callback: any) => {
    const clientName = call.request.name;
    callback(null, { greeting: `Hello ${clientName}! 🚀` });
  },
});

// 4. Start the server on port 50051 using insecure channels
server.bindAsync(
  "127.0.0.1:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log(
      "🚀 Absolute Barebones Hello Server listening on port 50051...",
    );
  },
);
```

---

### Step 3: The Bare Minimum Client (`src/Lesson-04/client.ts`)

- Loads the exact same blueprint,
- Dials the server
- Fires the function as if it were a local function block.

```typescript
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { join } from "node:path";

// 1. Load the exact same proto file blueprint
const PROTO_PATH = join(process.cwd(), "src/Lesson-04/hello.proto");
const packageDef = protoLoader.loadSync(PROTO_PATH);
const helloPkg = grpc.loadPackageDefinition(packageDef).hello as any;

// 2. Create the connection client stub
const client = new helloPkg.HelloService(
  "127.0.0.1:50051",
  grpc.credentials.createInsecure(),
);

console.log("⏳ [Client] Sending hello transaction request...");

// 3. Execute the function call passing our structured data object
client.SayHello({ name: "Nabil" }, (error: any, response: any) => {
  if (error) {
    console.error(`❌ Network Error: ${error.message}`);
    return;
  }

  // 4. Look at our clean output!
  console.log(`📥 [Client] Server responded: ${response.greeting}`);
});
```

---

### Step 4: Run the Lesson 4 Hello World! 🏎️

1. Fire up the minimal server process in your server terminal:

```bash
npx tsx ./src/Lesson-04/server.ts

```

1. Trigger the client caller in your client terminal split:

```bash
npx tsx ./src/Lesson-04/client.ts

```
