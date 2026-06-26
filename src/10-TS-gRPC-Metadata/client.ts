import grpc from "@grpc/grpc-js";
import { UserServiceClient } from "./user.js";

const client = new UserServiceClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure(),
);

// 1. Create a Metadata instance container
const meta = new grpc.Metadata();
meta.add("authorization", "Bearer my-secret-workout-jwt-token");
meta.add("x-request-id", "req-987654321");

console.log("🔒 Sending RPC request with secure metadata context...");

// 2. Pass the metadata instance as the second parameter block
client.getSecureProfile({ userId: "user_nabil_123" }, meta, (err, res) => {
  if (err) {
    console.error(`❌ Request Rejected [Code ${err.code}]: ${err.message}`);
    return;
  }

  console.log("✅ Secure payload decoded successfully:");
  console.log(`User Email: ${res?.email}`);
  console.log(`Active Workout Strategy: ${res?.currentPlan}`);
});
