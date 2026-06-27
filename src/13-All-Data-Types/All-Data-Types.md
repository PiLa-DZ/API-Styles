# All Data Types

- This includes all
  - scalar types
    - integers
    - floats
    - variants
  - complex structures
    - enums
    - maps
    - repeated arrays
    - optionals
  - nested messages
  - polymorphism variants (`oneof`).

---

## Step 1: The Ultimate Proto (`src/user.proto`)

Replace everything in your `src/user.proto` file
with this master schema layout:

```protobuf
syntax = "proto3";
package MasterPackage;

// 1. Enum Definition
enum AccountStatus {
  STATUS_UNKNOWN = 0; // proto3 requires the first element to map to 0
  STATUS_ACTIVE = 1;
  STATUS_SUSPENDED = 2;
  STATUS_BANNED = 3;
}

// 2. Child Message for nesting references
message SubProfile {
  string bio = 1;
  string avatarUrl = 2;
}

// 3. The Master Payload encompassing all type families
message ComprehensiveDataRequest {
  // --- Text & Binary Types ---
  string textString = 1;
  bytes rawBinaryData = 2; // Maps to Uint8Array in TypeScript

  // --- Boolean Type ---
  bool isPremiumUser = 3;

  // --- Floating-Point Types ---
  float singlePrecisionFloat = 4; // 32-bit floating point
  double doublePrecisionFloat = 5; // 64-bit floating point

  // --- Standard Signed Integer Types (Variable-length encoding) ---
  int32 standardInt32 = 6;
  int64 standardInt64 = 7; // Maps to Long or string/number depending on compiler

  // --- Unsigned Integer Types (Variable-length encoding) ---
  uint32 unsignedInt32 = 8;
  uint64 unsignedInt64 = 9;

  // --- Signed Integers with Efficient Negative Encoding (ZigZag encoding) ---
  sint32 signedZigZagInt32 = 10;
  sint64 signedZigZagInt64 = 11;

  // --- Fixed-Length Integers (Always takes 4 or 8 bytes respectively) ---
  fixed32 fixedLengthInt32 = 12;
  fixed64 fixedLengthInt64 = 13;
  sfixed32 signedFixedLengthInt32 = 14;
  sfixed64 signedFixedLengthInt64 = 15;

  // --- Complex Collection Fields ---
  repeated string tagList = 16;                     // Array/List type
  map<string, string> configurationMap = 17;        // Key-Value Dictionary map

  // --- Structuring & References ---
  AccountStatus currentStatus = 18;                 // Enum value link
  SubProfile nestedProfile = 19;                    // Embedded Sub-Message Object

  // --- Explicit Modifiers & Polymorphism ---
  optional string conditionalNickname = 20;         // Nullable variable field

  oneof identityVerification {                      // Mutual Exclusion (Only one can be set at a time)
    string passportNumber = 21;
    string nationalIdNumber = 22;
  }
}

message MasterResponse {
  bool processingSuccess = 1;
  string summaryLog = 2;
}

service MasterService {
  rpc SubmitComprehensiveData(ComprehensiveDataRequest) returns (MasterResponse);
}
```

---

## Step 2: Regenerate Code ⚡

Run the compiler in your terminal to map these scalar types
directly to matching TypeScript interfaces:

```bash
npm run generate

```

---

## Step 3: Implement the Master Type Server (`src/server.ts`)

Here is how all these primitives
map to your typed server implementation.
Notice how `bytes` translates to a Node.js `Buffer`
or `Uint8Array`, enums map to numeric constants,
and `optional` fields are evaluated safely.

```typescript
import grpc from "@grpc/grpc-js";
import { MasterServiceService, type MasterServiceServer } from "./user.js";

const server = new grpc.Server();

const serviceHandlers: MasterServiceServer = {
  submitComprehensiveData: (call, callback) => {
    const req = call.request;

    console.log("📥 Comprehensive Payload Received on Server!");
    console.log(`- String: ${req.textString}`);
    console.log(`- Boolean: ${req.isPremiumUser}`);
    console.log(`- Binary Length: ${req.rawBinaryData.length} bytes`);
    console.log(
      `- Standard Int32: ${req.standardInt32} (Type: ${typeof req.standardInt32})`,
    );
    console.log(`- Double Float: ${req.doublePrecisionFloat}`);
    console.log(`- Enum Status Code: ${req.currentStatus}`);
    console.log(`- Nested Bio: ${req.nestedProfile?.bio}`);

    // Evaluating optional modifier field
    if (req.conditionalNickname !== undefined) {
      console.log(`- Optional Nickname Present: ${req.conditionalNickname}`);
    }

    // Evaluating polymorphism oneof variant properties
    if (req.passportNumber) {
      console.log(`- Identity Verified via Passport: ${req.passportNumber}`);
    } else if (req.nationalIdNumber) {
      console.log(
        `- Identity Verified via National ID: ${req.nationalIdNumber}`,
      );
    }

    callback(null, {
      processingSuccess: true,
      summaryLog: `Successfully processed complex matrix payload at timestamp: ${Date.now()}`,
    });
  },
};

server.addService(MasterServiceService, serviceHandlers);

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) return console.error(err.message);
    console.log(
      `🚀 Comprehensive Type Validation Server running on port ${port}`,
    );
  },
);
```

---

## Step 4: Implement the Master Client (`src/client.ts`)

Let's populate every single data block
from the client to confirm type compatibility across the wire:

```typescript
import grpc from "@grpc/grpc-js";
import { MasterServiceClient, AccountStatus } from "./user.js";

const client = new MasterServiceClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure(),
);

// Instantiate a comprehensive payload respecting ts-proto type guarantees
const megaPayload = {
  textString: "Hello from Arch Linux terminal environment!",
  rawBinaryData: Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]), // bytes type
  isPremiumUser: true,
  singlePrecisionFloat: 3.14159,
  doublePrecisionFloat: 123456.7891011,

  // Integers
  standardInt32: 42,
  standardInt64: 9007199254740991, // safe JavaScript max integer bounds
  unsignedInt32: 500,
  unsignedInt64: 1000,
  signedZigZagInt32: -25,
  signedZigZagInt64: -100000,
  fixedLengthInt32: 8888,
  fixedLengthInt64: 99999,
  signedFixedLengthInt32: -444,
  signedFixedLengthInt64: -5555,

  // Complex lists and structural dictionaries
  tagList: ["TypeScript", "gRPC", "Protobuf", "Backend-Engineering"],
  configurationMap: {
    environment: "production",
    logLevel: "debug",
    databasePoolSize: "20",
  },

  // Linked Enum references & nested structures
  currentStatus: AccountStatus.STATUS_ACTIVE,
  nestedProfile: {
    bio: "Full-stack developer focusing on high throughput messaging layers.",
    avatarUrl: "https://example.com/assets/avatar.png",
  },

  // Explicit optionals
  conditionalNickname: "The_Code_Architect",

  // OneOf polymorphism constraint (providing Passport removes National ID verification)
  passportNumber: "A-987654321_X",
};

console.log("📡 Sending complete datatype matrix payload upstream...");

client.submitComprehensiveData(megaPayload, (err, response) => {
  if (err) {
    console.error(`❌ Data submission error: ${err.message}`);
    return;
  }
  console.log(
    `✅ Server Confirmation: Status [Success: ${response?.processingSuccess}]`,
  );
  console.log(`📝 Server Log Summary: "${response?.summaryLog}"`);
});
```

---

```bash
# TODO: Server side
~/Github/Backend/API-Styles (gRPC ✗) npx tsx src/13-All-Data-Types/server.ts
🚀 Comprehensive Type Validation Server running on port 50051
📥 Comprehensive Payload Received on Server!
- String: Hello from Arch Linux terminal environment!
- Boolean: true
- Binary Length: 5 bytes
- Standard Int32: 42 (Type: number)
- Double Float: 123456.7891011
- Enum Status Code: 1
- Nested Bio: Full-stack developer focusing on high throughput messaging layers.
- Optional Nickname Present: The_Code_Architect
- Identity Verified via Passport: A-987654321_X

# TODO: Client side
~/Github/Backend/API-Styles (gRPC ✗) npx tsx src/13-All-Data-Types/client.ts
📡 Sending complete datatype matrix payload upstream...
✅ Server Confirmation: Status [Success: true]
📝 Server Log Summary: "Successfully processed complex matrix payload at timestamp: 1782579113791"
~/Github/Backend/API-Styles (gRPC ✗)

```
