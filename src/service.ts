import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { join } from "node:path";
import { workouts } from "./data.js"; // Ensure this file exists with your mock arrays

// 1. Load the proto file path dynamically
const PROTO_PATH = join(process.cwd(), "src", "workouts.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// 2. Extract the workouts package object from the loaded definition definitions map
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const workoutsPackage = protoDescriptor.workouts;

// 3. Define the actual business processing logic for our RPC operations
const serviceHandlers = {
  GetWorkoutList: (call: any, callback: any) => {
    // In gRPC, parameters arrive inside the "call.request" object block
    const userId = call.request.user_id;
    console.log(
      `📡 [Server] gRPC method invoked! Processing data for User: ${userId}`,
    );

    const userWorkouts = workouts
      .filter((w) => w.userId === userId)
      .map((w) => ({
        id: w.id,
        title: w.title,
        duration: w.duration,
      }));

    // Standard Node style callback: (error, response_payload)
    callback(null, { workouts: userWorkouts });
  },
};

// 4. Initialize and operate the structural gRPC Server Container
function startServer() {
  const server = new grpc.Server();

  // Bind our schema mapping service description to our actual controller logic functions
  server.addService(workoutsPackage.WorkoutService.service, serviceHandlers);

  const address = "127.0.0.1:50051";

  // gRPC uses HTTP/2 under the hood, requiring specific credentials flags (Insecure for local dev)
  server.bindAsync(
    address,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(`Failed to bind server: ${err.message}`);
        return;
      }
      console.log(
        `🚀 gRPC Microservice operational and listening at ${address}`,
      );
    },
  );
}

startServer();
