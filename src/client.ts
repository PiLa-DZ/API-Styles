import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { join } from "node:path";

// 1. The client must load the exact same schema blueprint file to understand the binary mapping
const PROTO_PATH = join(process.cwd(), "src", "workouts.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const WorkoutService = protoDescriptor.workouts.WorkoutService;

// 2. Instantiate the auto-generated Client Stub container pointing to our port location
const client = new WorkoutService(
  "127.0.0.1:50051",
  grpc.credentials.createInsecure(),
);

console.log(
  "⏳ [Client] Initiating internal microservice RPC transaction call...",
);

// 3. Execute the function name directly as if it were a local function definition block!
client.GetWorkoutList({ user_id: "u-1" }, (error: any, response: any) => {
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
