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
