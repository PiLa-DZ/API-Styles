import grpc from "@grpc/grpc-js";
import { MasterServiceService, type MasterServiceServer } from "./user.js";

const server = new grpc.Server();

const serviceHandlers: MasterServiceServer = {
  submitComprehensiveData: (call, callback) => {
    const req = call.request;

    console.log("📥 Comprehensive Payload Received on Server!");
    console.log(`- String: ${req.textString}`);
    console.log(`- Boolean: ${req.isPremiumUser}`);
    console.log(`- Binary Length: ${req.rawBinaryData.length} bytes`);
    console.log(
      `- Standard Int32: ${req.standardInt32} (Type: ${typeof req.standardInt32})`,
    );
    console.log(`- Double Float: ${req.doublePrecisionFloat}`);
    console.log(`- Enum Status Code: ${req.currentStatus}`);
    console.log(`- Nested Bio: ${req.nestedProfile?.bio}`);

    // Evaluating optional modifier field
    if (req.conditionalNickname !== undefined) {
      console.log(`- Optional Nickname Present: ${req.conditionalNickname}`);
    }

    // Evaluating polymorphism oneof variant properties
    if (req.passportNumber) {
      console.log(`- Identity Verified via Passport: ${req.passportNumber}`);
    } else if (req.nationalIdNumber) {
      console.log(
        `- Identity Verified via National ID: ${req.nationalIdNumber}`,
      );
    }

    callback(null, {
      processingSuccess: true,
      summaryLog: `Successfully processed complex matrix payload at timestamp: ${Date.now()}`,
    });
  },
};

server.addService(MasterServiceService, serviceHandlers);

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) return console.error(err.message);
    console.log(
      `🚀 Comprehensive Type Validation Server running on port ${port}`,
    );
  },
);
