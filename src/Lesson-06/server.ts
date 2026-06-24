import grpc from "@grpc/grpc-js";
import { UserServiceService, type UserServiceServer } from "./user.js";

type User = {
  id: string;
  name: string;
  age: number;
};

const server = new grpc.Server();

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
