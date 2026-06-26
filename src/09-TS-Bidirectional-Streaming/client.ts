import grpc from "@grpc/grpc-js";
import { UserServiceClient } from "./user.js";

const client = new UserServiceClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure(),
);

// Open the duplex connection channel
const chatStream = client.liveCoachChat();

// 1. Listen for continuous real-time replies from the server
chatStream.on("data", (reply) => {
  console.log(`🤖 [${reply.sender} says]: ${reply.message}`);
});

chatStream.on("end", () => {
  console.log("🛑 Connection terminated by the server.");
});

chatStream.on("error", (err) => {
  console.error(`❌ Client Pipeline Error: ${err.message}`);
});

// 2. Simulate streaming out user phrases asynchronously over time
console.log("✉️ Sending initial greeting...");
chatStream.write({
  sender: "Nabil",
  message: "Hey coach! Starting my workout now.",
});

setTimeout(() => {
  console.log("✉️ Sending update packet...");
  chatStream.write({
    sender: "Nabil",
    message: "Man, I am feeling really tired on this third set.",
  });
}, 2000);

setTimeout(() => {
  console.log("✉️ Finishing up stream...");
  chatStream.write({
    sender: "Nabil",
    message: "All sets done! Closing session.",
  });
  chatStream.end(); // Let the server know we're checking out
}, 4000);
