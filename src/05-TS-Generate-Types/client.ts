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
