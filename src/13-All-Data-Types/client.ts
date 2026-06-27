import grpc from "@grpc/grpc-js";
import { MasterServiceClient, AccountStatus } from "./user.js";

const client = new MasterServiceClient(
  "0.0.0.0:50051",
  grpc.credentials.createInsecure(),
);

// Instantiate a comprehensive payload respecting ts-proto type guarantees
const megaPayload = {
  textString: "Hello from Arch Linux terminal environment!",
  rawBinaryData: Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]), // bytes type
  isPremiumUser: true,
  singlePrecisionFloat: 3.14159,
  doublePrecisionFloat: 123456.7891011,

  // Integers
  standardInt32: 42,
  standardInt64: 9007199254740991, // safe JavaScript max integer bounds
  unsignedInt32: 500,
  unsignedInt64: 1000,
  signedZigZagInt32: -25,
  signedZigZagInt64: -100000,
  fixedLengthInt32: 8888,
  fixedLengthInt64: 99999,
  signedFixedLengthInt32: -444,
  signedFixedLengthInt64: -5555,

  // Complex lists and structural dictionaries
  tagList: ["TypeScript", "gRPC", "Protobuf", "Backend-Engineering"],
  configurationMap: {
    environment: "production",
    logLevel: "debug",
    databasePoolSize: "20",
  },

  // Linked Enum references & nested structures
  currentStatus: AccountStatus.STATUS_ACTIVE,
  nestedProfile: {
    bio: "Full-stack developer focusing on high throughput messaging layers.",
    avatarUrl: "https://example.com/assets/avatar.png",
  },

  // Explicit optionals
  conditionalNickname: "The_Code_Architect",

  // OneOf polymorphism constraint (providing Passport removes National ID verification)
  passportNumber: "A-987654321_X",
};

console.log("📡 Sending complete datatype matrix payload upstream...");

client.submitComprehensiveData(megaPayload, (err, response) => {
  if (err) {
    console.error(`❌ Data submission error: ${err.message}`);
    return;
  }
  console.log(
    `✅ Server Confirmation: Status [Success: ${response?.processingSuccess}]`,
  );
  console.log(`📝 Server Log Summary: "${response?.summaryLog}"`);
});
