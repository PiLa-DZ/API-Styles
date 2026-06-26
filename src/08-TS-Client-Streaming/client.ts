import grpc from "@grpc/grpc-js";
import { UserServiceClient } from "./user.js";

const client = new UserServiceClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure(),
);

// Call the method. We supply the standard callback that fires once the server responds.
const stream = client.recordWorkoutSession((err, response) => {
  if (err) {
    console.error(`❌ Server returned error: ${err.message}`);
    return;
  }
  console.log(`🏁 Server response acknowledgment:\n${response?.msg}`);
});

console.log("🚀 Starting continuous metric streaming...");

// Stream data packets smoothly over the open pipeline
stream.write({ exerciseName: "Squat", weightUsed: 100 });
stream.write({ exerciseName: "Squat", weightUsed: 120 });
stream.write({ exerciseName: "Bench Press", weightUsed: 80 });
stream.write({ exerciseName: "Overhead Press", weightUsed: 60 });

// Tell the server we are completely done streaming data
stream.end();
