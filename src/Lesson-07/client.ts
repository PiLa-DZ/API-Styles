import grpc from "@grpc/grpc-js";
import { UserServiceClient } from "./user.js";

const client = new UserServiceClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure(),
);

console.log("🔗 Connecting to server activity stream...");

// Call the stream method. It returns a readable stream channel immediately.
const stream = client.streamUserActivities({ firstName: "Nabil" });

// Listen for incoming chunks from the server
stream.on("data", (response) => {
  console.log(`📥 Received from stream: ${response.msg}`);
});

// Triggers when the server executes call.end()
stream.on("end", () => {
  console.log("🛑 Stream ended by the server.");
});

// Triggers if a connection error happens
stream.on("error", (err) => {
  console.error(`❌ Stream Error: ${err.message}`);
});
