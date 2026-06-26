import grpc from "@grpc/grpc-js";
import { UserServiceService, type UserServiceServer } from "./user.js";

const server = new grpc.Server();

const serviceHandlers: UserServiceServer = {
  liveCoachChat: (call) => {
    console.log("⚡ [Server] Real-time bidirectional chat pipeline opened.");

    // Listen to incoming messages streaming from the client
    call.on("data", (incomingChat) => {
      console.log(
        `💬 [Received from ${incomingChat.sender}]: ${incomingChat.message}`,
      );

      // Automated system response triggered instantly over the same open pipe
      let replyMessage = "Keep pushing! Let's get those reps in! 💪";
      if (incomingChat.message.toLowerCase().includes("tired")) {
        replyMessage =
          "Take a 90-second hydration break, then finish strong! 💧";
      }

      call.write({
        sender: "AI Coach",
        message: replyMessage,
      });
    });

    // Triggers when the client stops streaming via stream.end()
    call.on("end", () => {
      console.log("🏁 [Server] Client closed their end of the chat session.");
      call.end(); // Gracefully terminate our side of the stream pipeline too
    });

    call.on("error", (err) => {
      console.error(`❌ [Server] Stream error: ${err.message}`);
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
    console.log(`🚀 Full-Duplex Chat Server listening on port ${port}`);
  },
);
