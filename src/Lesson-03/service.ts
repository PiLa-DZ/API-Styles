import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { join } from "node:path";

const hiPkg = grpc.loadPackageDefinition(
  protoLoader.loadSync(join(process.cwd(), "src/Lesson-03", "workouts.proto"), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }),
).hiPkg as any;

// -------------------------------------------------------------
const server = new grpc.Server();

server.addService(hiPkg.hiService.service, {
  sayHi: (call: any, callback: any) => {
    callback(null, { msg: `Hi ${call.request.name}` });
  },
});

server.bindAsync(
  "127.0.0.1:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error(`Failed to bind server: ${err.message}`);
      return;
    }
    console.log(`🚀 gRPC Microservice operational and listening at`);
  },
);
