import grpc from "@grpc/grpc-js";
import { UserServiceClient } from "./user.js";

const client = new UserServiceClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure(),
);

// Helper utility function to make testing quick and easy
const fetchWorkout = (id: string) => {
  console.log(`\n📡 Requesting ID: "${id}"...`);

  client.getWorkoutDetails({ workoutId: id }, (err, res) => {
    if (err) {
      // Handle known protocol status codes
      if (err.code === grpc.status.INVALID_ARGUMENT) {
        console.error(`❌ [Bad Request - Code ${err.code}]: ${err.message}`);
      } else if (err.code === grpc.status.NOT_FOUND) {
        console.error(`❌ [Not Found - Code ${err.code}]: ${err.message}`);
      } else {
        console.error(
          `❌ [Unexpected Error - Code ${err.code}]: ${err.message}`,
        );
      }
      return;
    }

    console.log(
      `✅ Success! Routine: "${res?.title}" (${res?.targetSets} working sets)`,
    );
  });
};

// Test Case 1: Fire a perfectly valid execution pathway
setTimeout(() => fetchWorkout("workout_01"), 0);

// Test Case 2: Fire an invalid input format block to trigger INVALID_ARGUMENT (3)
setTimeout(() => fetchWorkout("invalid-id-format-123"), 1000);

// Test Case 3: Fire a missing resource pathway to trigger NOT_FOUND (5)
setTimeout(() => fetchWorkout("workout_999"), 2000);
