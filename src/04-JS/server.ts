import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { join } from "node:path";

// 1. Load our proto file blueprint
const PROTO_PATH = join(process.cwd(), "src/Lesson-04/hello.proto");
const packageDef = protoLoader.loadSync(PROTO_PATH);
const helloPkg = grpc.loadPackageDefinition(packageDef).hello as any;

// 2. Create the server container
const server = new grpc.Server();

// 3. Add our service handler function (Remember: inputs and outputs must be objects!)
server.addService(helloPkg.HelloService.service, {
  SayHello: (call: any, callback: any) => {
    const clientName = call.request.name;
    callback(null, { greeting: `Hello ${clientName}! 🚀` });
  },
});

// 4. Start the server on port 50051 using insecure channels
server.bindAsync(
  "127.0.0.1:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log(
      "🚀 Absolute Barebones Hello Server listening on port 50051...",
    );
  },
);
