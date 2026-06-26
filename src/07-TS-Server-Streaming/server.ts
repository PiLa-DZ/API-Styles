import grpc from "@grpc/grpc-js";
import { UserServiceService, type UserServiceServer } from "./user.js";

const server = new grpc.Server();

const serviceHandlers: UserServiceServer = {
  createUser: (call, callback) => {
    callback(null, { msg: "Data processed successfully! ✅" });
  },

  // Implement your new Server Streaming method
  streamUserActivities: (call) => {
    const { firstName } = call.request;
    console.log(`📡 Starting activity stream for user: ${firstName}`);

    const activities = [
      "Started a new bench press set",
      "Completed 12 reps of bicep curls",
      "Updated workout plan duration",
      "Finished workout session 🏋️",
    ];

    let index = 0;

    // Simulate real-time server events pushing data every 1.5 seconds
    const intervalId = setInterval(() => {
      if (index < activities.length) {
        const activity = activities[index];

        // Push a data chunk down to the client channel
        call.write({
          msg: `[Notification] ${firstName} ${activity}`,
        });

        index++;
      } else {
        // No more data to send. Close the stream pipeline gracefully.
        clearInterval(intervalId);
        call.end();
        console.log(`🏁 Stream for ${firstName} closed.`);
      }
    }, 1500);
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
    console.log(`🚀 gRPC server running with streaming on port ${port}`);
  },
);
