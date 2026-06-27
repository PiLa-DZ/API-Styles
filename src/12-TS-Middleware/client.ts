import grpc from "@grpc/grpc-js";
import { UserServiceClient } from "./user.js";

const client = new UserServiceClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure(),
);

const runTask = (tokenValue: string, label: string) => {
  const meta = new grpc.Metadata();
  meta.add("authorization", tokenValue);

  console.log(`\n📡 Dispatching Task [${label}]...`);

  client.executeTask(
    { payload: `Data packet from ${label}` },
    meta,
    (err, res) => {
      if (err) {
        console.error(
          `❌ Client Received Error [Code ${err.code}]: ${err.message}`,
        );
        return;
      }
      console.log(`✅ Client Received Success response: "${res?.result}"`);
    },
  );
};

// Test Case 1: Send valid credentials to pass through the interceptor successfully
setTimeout(() => {
  runTask("Bearer secure-production-token", "Valid Request Setup");
}, 0);

// Test Case 2: Send fake credentials to watch the interceptor block it globally
setTimeout(() => {
  runTask("Bearer fake-token-123", "Malicious Request Setup");
}, 1500);
