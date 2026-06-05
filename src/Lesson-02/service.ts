import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { join } from "node:path";
import { workouts } from "./data.js";

const PROTO_PATH = join(process.cwd(), "src/Lesson-02", "workouts.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true });
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const workoutsPackage = protoDescriptor.workouts;

const serviceHandlers = {
  // Maintain Lesson 1 handler compatibility
  GetWorkoutList: (call: any, callback: any) => {
    const userWorkouts = workouts.filter((w) => w.userId === call.request.user_id);
    callback(null, { workouts: userWorkouts });
  },

  // LESSON 2: Stream workouts out individual piece by individual piece
  StreamWorkouts: (call: any) => {
    const userId = call.request.user_id;
    console.log(`📡 [Server] Stream channel opened for User: ${userId}`);

    const userWorkouts = workouts.filter((w) => w.userId === userId);

    // Simulate database retrieval delays to clearly see the streaming behavior
    userWorkouts.forEach((workout, index) => {
      setTimeout(() => {
        console.log(`📦 [Server] Pushing streaming item: ${workout.title}`);
        
        // Write a single plain message down the network stream pipeline channel
        call.write({
          id: workout.id,
          title: workout.title,
          duration: workout.duration,
        });

        // If we reached the final item in the loop, close the network stream channel connection
        if (index === userWorkouts.length - 1) {
          console.log("🏁 [Server] All items pushed. Closing stream.");
          call.end();
        }
      }, (index + 1) * 1000); // Emits 1 item per second sequentially
    });
  },
};

function startServer() {
  const server = new grpc.Server();
  server.addService(workoutsPackage.WorkoutService.service, serviceHandlers);
  server.bindAsync("127.0.0.1:50051", grpc.ServerCredentials.createInsecure(), () => {
    console.log("🚀 Lesson 2 Stream Server operating at 127.0.0.1:50051");
  });
}

startServer();
