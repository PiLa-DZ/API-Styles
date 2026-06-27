import grpc from "@grpc/grpc-js";
import { UserServiceService, type UserServiceServer } from "./user.js";

// 1. Create a type-safe higher-order function wrapper for Unary handlers
function withLoggingAndAuth<Req, Res>(
  handler: grpc.handleUnaryCall<Req, Res>,
): grpc.handleUnaryCall<Req, Res> {
  return (call, callback) => {
    const startTime = Date.now();
    const path = call.getPath?.() || "Unknown Path";

    console.log(`\n==================================================`);
    console.log(`⏱️  [Interceptor] Incoming RPC: ${path}`);

    // Global Authentication Check
    const authHeader = call.metadata.get("authorization");
    const token = authHeader[0];

    if (!token || token !== "Bearer secure-production-token") {
      console.error(`🛑 [Interceptor] Auth Denied for path: ${path}`);
      return callback({
        code: grpc.status.UNAUTHENTICATED,
        message: "Global Interceptor: Access Denied. Invalid Token.",
      });
    }

    console.log(`🔑 [Interceptor] Auth Verified successfully.`);

    // Intercept the final callback response to calculate duration
    const interceptedCallback: grpc.sendUnaryData<Res> = (
      err,
      response,
      trailer,
      flags,
    ) => {
      const duration = Date.now() - startTime;
      console.log(`📈 [Interceptor] RPC ${path} resolved in ${duration}ms`);
      console.log(`==================================================`);

      // Pass the response down to the client
      callback(err, response, trailer, flags);
    };

    // Execute the actual core service handler with our intercepted callback
    handler(call, interceptedCallback);
  };
}

// 2. Initialize your server normally (no invalid interceptor options needed here)
const server = new grpc.Server();

// 3. Apply your interceptor wrapper cleanly over the handlers
const serviceHandlers: UserServiceServer = {
  executeTask: withLoggingAndAuth((call, callback) => {
    console.log(
      `🎯 [Handler] Executing core service logic for payload: "${call.request.payload}"`,
    );
    callback(null, { result: `Processed: ${call.request.payload}` });
  }),
};

server.addService(UserServiceService, serviceHandlers);

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) return console.error(err.message);
    console.log(`🚀 Middleware Interceptor Server listening on port ${port}`);
  },
);
