import grpc from "@grpc/grpc-js";
import { UserServiceService, type UserServiceServer } from "./user.js";

const server = new grpc.Server();

const serviceHandlers: UserServiceServer = {
  getSecureProfile: (call, callback) => {
    // 1. Extract metadata keys (gRPC metadata keys are ALWAYS lowercase)
    const authHeader = call.metadata.get("authorization");
    const token = authHeader[0]; // metadata.get returns an array of values

    console.log(`📡 Incoming request metadata token: ${token}`);

    // 2. Validate token presence (Basic plumbing checkpoint)
    if (!token || token !== "Bearer my-secret-workout-jwt-token") {
      return callback({
        code: grpc.status.UNAUTHENTICATED,
        message: "Invalid or missing authorization token!",
      });
    }

    // 3. Token is valid, return secure data block
    callback(null, {
      email: "nabil@example.com",
      currentPlan: "Hypertrophy Push/Pull/Legs",
    });
  },
};

server.addService(UserServiceService, serviceHandlers);

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) return console.error(err.message);
    console.log(`🚀 Secure Production Server listening on port ${port}`);
  },
);
