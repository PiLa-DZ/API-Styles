import grpc from "@grpc/grpc-js";
import { UserServiceService, type UserServiceServer } from "./user.js";

const server = new grpc.Server();

// Mock database collection
const workoutDatabase: Record<string, { title: string; targetSets: number }> = {
  workout_01: { title: "Heavy Push Day (Chest/Triceps)", targetSets: 16 },
  workout_02: { title: "Leg Hypertrophy Focus", targetSets: 20 },
};

const serviceHandlers: UserServiceServer = {
  getWorkoutDetails: (call, callback) => {
    const { workoutId } = call.request;

    console.log(`🔍 Searching database for workout ID: "${workoutId}"`);

    // 1. Validation Error: Check if the string parameter format is valid
    if (!workoutId.startsWith("workout_")) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Malformed input format. ID must begin with prefix 'workout_'",
      });
    }

    const workout = workoutDatabase[workoutId];

    // 2. Resource Missing Error: Check if data exists in memory
    if (!workout) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: `No workout record found matching the ID: '${workoutId}'`,
      });
    }

    // 3. Success condition
    callback(null, workout);
  },
};

server.addService(UserServiceService, serviceHandlers);

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) return console.error(err.message);
    console.log(`🚀 Error Handling Lab Server listening on port ${port}`);
  },
);
