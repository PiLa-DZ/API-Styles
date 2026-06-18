import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { join } from "node:path";

// 1. Load the exact same proto file blueprint
const PROTO_PATH = join(process.cwd(), "src/Lesson-04/hello.proto");
const packageDef = protoLoader.loadSync(PROTO_PATH);
const helloPkg = grpc.loadPackageDefinition(packageDef).hello as any;

// 2. Create the connection client stub
const client = new helloPkg.HelloService(
  "127.0.0.1:50051",
  grpc.credentials.createInsecure(),
);

console.log("⏳ [Client] Sending hello transaction request...");

// 3. Execute the function call passing our structured data object
client.SayHello({ name: "Nabil" }, (error: any, response: any) => {
  if (error) {
    console.error(`❌ Network Error: ${error.message}`);
    return;
  }

  // 4. Look at our clean output!
  console.log(`📥 [Client] Server responded: ${response.greeting}`);
});
