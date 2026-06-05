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

const client = new hiPkg.hiService(
  "127.0.0.1:50051",
  grpc.credentials.createInsecure(),
);

console.log(
  "⏳ [Client] Initiating internal microservice RPC transaction call...",
);

client.sayHi({ name: "Nabil" }, (error: any, response: any) => {
  if (error) {
    console.error(
      `❌ Microservice network transaction error: ${error.message}`,
    );
    return;
  }

  console.log(
    "📥 [Client] Microservice response received back from port 50051:",
  );
  console.dir(response, { depth: null, colors: true });
});
