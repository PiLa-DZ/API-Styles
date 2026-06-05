import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { join } from "node:path";

const PROTO_PATH = join(process.cwd(), "src/Lesson-02", "workouts.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true });
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const WorkoutService = protoDescriptor.workouts.WorkoutService;

const client = new WorkoutService(
  "127.0.0.1:50051",
  grpc.credentials.createInsecure(),
);

console.log(
  "⏳ [Client] Subscribing to internal microservice server data stream...",
);

// Invoke our streaming method function
const streamChannel = client.StreamWorkouts({ user_id: "u-1" });

// Listen for incoming data packets piece by piece asynchronously over HTTP/2
streamChannel.on("data", (workoutItem: any) => {
  console.log("📥 [Client] Received streamed item chunk packet from server:");
  console.dir(workoutItem, { colors: true });
});

// Listen for the server terminating the channel link gracefully
streamChannel.on("end", () => {
  console.log(
    "🛑 [Client] Server stream finished transmitting. Channel closed.",
  );
});
