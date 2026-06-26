# FILE: ./src/user.proto

```ts
syntax = "proto3";
package UserPackage;

message req {
  string name = 1;
  int32 age = 2;
}

message res {
  string msg = 1;
}

message HealthRequest {}

service UserService {
  rpc Health(HealthRequest) returns (res);
  rpc CreateUser(req) returns (res);
}
```

---

```json
  "scripts": {
    "check": "tsc --noEmit",
    "generate": "protoc -I ./src --plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=./src --ts_proto_opt=outputServices=grpc-js,esModuleInterop=true user.proto",
    "dev:server": "tsx watch ./src/server.ts",
    "dev:client": "tsx ./src/client.ts"
  },

```

```bash
# 1. Install the protoc compiler engine from the official Arch extra repositories
sudo pacman -S protobuf

# 2. Install the ts-proto automation tool in your project dependencies
npm install --save-dev ts-proto

npm run generate
```

---

### FILE: ./src/server.ts

```ts
import grpc from "@grpc/grpc-js";
import { UserServiceService, type UserServiceServer } from "./user.js";

type User = {
  id: string;
  name: string;
  age: number;
};

const Users: User[] = [];
const server = new grpc.Server();

const serviceHandlers: UserServiceServer = {
  createUser: (call, callback) => {
    const { name, age } = call.request;
    const newUser: User = {
      id: `${Math.random()}`,
      name,
      age,
    };
    Users.push(newUser);
    callback(null, {
      msg: `Success create user: ${JSON.stringify(Users, null, 2)}`,
    });
  },
  health: (call, callback) => {
    callback(null, { msg: "Health is OK" });
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
    console.log(`🚀 Automated-type gRPC server listening on port ${port}`);
  },
);
```

### FILE: ./src/client.ts

```ts
import grpc from "@grpc/grpc-js";
import { UserServiceClient } from "./user.js";

const client = new UserServiceClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure(),
);

client.createUser({ name: "Nabil", age: 35 }, (err, res) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log(res?.msg);
});

client.health({}, (err, res) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log(res?.msg);
});
```
