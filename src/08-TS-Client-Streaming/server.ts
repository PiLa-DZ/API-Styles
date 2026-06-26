import grpc from "@grpc/grpc-js";
import { UserServiceService, type UserServiceServer } from "./user.js";

const server = new grpc.Server();

const serviceHandlers: UserServiceServer = {
  createUser: (call, callback) => {
    callback(null, { msg: "Data processed successfully! ✅" });
  },
  streamUserActivities: (call) => {
    // keeping previous implementation intact or clean
    call.end();
  },

  // Implement your new Client Streaming receiver method
  recordWorkoutSession: (call, callback) => {
    let completedSetsCount = 0;
    const trackingSummary: string[] = [];

    console.log("📥 Opened a incoming streaming channel from client...");

    // Listen to incoming chunks of workout metrics streamed by the client
    call.on("data", (metric) => {
      completedSetsCount++;
      const summaryLine = `${metric.exerciseName} at ${metric.weightUsed}kg`;
      trackingSummary.push(summaryLine);
      console.log(
        `[Chunk Received] Recorded set #${completedSetsCount}: ${summaryLine}`,
      );
    });

    // Emitted once the client finishes writing and closes its stream end
    call.on("end", () => {
      console.log("🏁 Client finished streaming metric chunks.");

      // Fire back our SINGLE unified response to close the transaction
      callback(null, {
        msg: `Session Saved successfully! Total sets processed: ${completedSetsCount}. Breakdown: [${trackingSummary.join(" | ")}]`,
      });
    });

    call.on("error", (err) => {
      console.error(`❌ Error while reading client stream: ${err.message}`);
    });
  },
};

server.addService(UserServiceService, serviceHandlers);

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log(`🚀 gRPC server running with client streaming on port ${port}`);
  },
);
