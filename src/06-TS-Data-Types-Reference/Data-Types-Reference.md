# Data & Streaming --> Protobuf Data Types Reference

When writing a `.proto` file,
you are defining a strict data layout that will be packed into binary.
Because of this, Protobuf has its own specialized keywords
for dealing with arrays, maps, optional values, and big numbers.

---

## 1. The Advanced Blueprint (`src/user.proto`)

Open your `src/user.proto` file and update it.
We are going to add arrays, maps, optional fields,
and huge numbers to your `UserRequest`:

```bash
syntax = "proto3";
package UserPackage;

message UserRequest {
  string firstName = 1;
  string lastName = 2;
  int32 age = 3;

  // 1. Arrays (Use the "repeated" keyword)
  repeated string hobbies = 4;

  // 2. Key-Value Maps (Syntax: map<KeyType, ValueType>)
  map<string, string> metadata = 5;

  // 3. Optional Fields (Use the "optional" keyword)
  optional string middleName = 6;

  // 4. Massive Numbers (Use "int64" for big IDs or timestamps)
  int64 longServerId = 7;
}

message UserResponse {
  string msg = 1;
}

service UserService {
  rpc CreateUser(UserRequest) returns (UserResponse);
}

```

---

## 2. Regenerate Your Types ⚡

Run your compilation script in your Arch terminal
to let `ts-proto` automatically handle the conversion:

```bash
npm run generate

```

---

## 3. How They Translate to TypeScript (The Reference Guide)

Open your generated `src/user.ts` file
or look at how TypeScript auto-completes them inside Neovim.
Here is exactly how Protobuf translates those new fields
into your development environment:

### 1. Arrays (`repeated string hobbies`)

- **TypeScript Type:** `string[]`

- **How it works:**
  It becomes a standard, native JavaScript array.
  You can read it,
  loops over it,
  or use standard array methods like `.push()` and `.map()`.

### 2. Maps (`map<string, string> metadata`)

- **TypeScript Type:** `{[key: string]: string}` (or `Record<string, string>`)

- **How it works:**
  It translates into a standard JavaScript object literal layout.
  You can access properties using bracket notation like `request.metadata["theme"]`.

### 3. Optional Fields (`optional string middleName`)

- **TypeScript Type:** `string | undefined`

- **How it works:**
  In standard proto3,
  if a string is empty,
  it returns `""`.
  By adding the `optional` keyword,
  it explicitly allows the field to be completely absent (`undefined`),
  which matches perfectly with how we handle optional fields in database schemas.

### 4. Massive Numbers (`int64 longServerId`)

- **TypeScript Type:** `number` (or `string` depending on options)

- **The Catch:**
  JavaScript numbers safely top out at $2^{53} - 1$ (`Number.MAX_SAFE_INTEGER`).
  Protobuf's `int64` can hold values up to $2^{63} - 1$.

- **Best Practice:**
  Since your `package.json` compilation options use standard settings,
  `ts-proto` casts it to a standard `number`.
  If you ever need to pass massive database IDs
  or high-precision microsecond timestamps that cross that maximum line,
  pass them as a `string` in your payload to prevent rounding errors!

---

## 4. Updating the Implementation Code

Let's look at how your `src/server.ts`
and `src/client.ts` handle these fields cleanly now.

### Inside `src/server.ts`

```typescript
const serviceHandlers: UserServiceServer = {
  createUser: (call, callback) => {
    // Look at how we extract the new fields safely!
    const { firstName, hobbies, metadata, middleName, longServerId } =
      call.request;

    console.log(`Hobbies Array: ${hobbies.join(", ")}`);
    console.log(`Metadata Map Value: ${metadata["role"]}`);
    console.log(`Optional Middle Name: ${middleName ?? "None provided"}`);
    console.log(`Massive ID Number: ${longServerId}`);

    callback(null, { msg: "Data processed successfully! ✅" });
  },
};
```

### Inside `src/client.ts`

```typescript
client.createUser(
  {
    firstName: "Nabil",
    lastName: "Dahman",
    age: 35,
    hobbies: ["Coding", "Networking", "Gym"], // Native Array
    metadata: { role: "admin", env: "development" }, // Native Object Map
    // middleName is omitted entirely here since it is optional!
    longServerId: 9876543210, // Large integer
  },
  (err, res) => {
    if (err) return console.error(err.message);
    console.log(res?.msg);
  },
);
```

```bash
# TODO: Step 1
~/Github/Backend/API-Styles (gRPC ✗) npx tsx ./src/Lesson-06/server.ts
🚀 Automated-type gRPC server listening on port 50051

# TODO: Step 2
~/Github/Backend/API-Styles (gRPC ✗) npx tsx ./src/Lesson-06/client.ts
Data processed successfully! ✅
~/Github/Backend/API-Styles (gRPC ✗)

# NOTE: Output:
Hobbies Array: Coding, Networking, Gym
Metadata Map Value: admin
Optional Middle Name: None provided
Massive ID Number: 9876543210
```
