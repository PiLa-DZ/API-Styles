import grpc from "@grpc/grpc-js";
import { UserServiceClient } from "./user.js";

const client = new UserServiceClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure(),
);

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
