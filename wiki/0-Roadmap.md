# gRPC Roadmap

## Core Fundamentals

- [x] **Protobuf Syntax (`proto3`)**:
      service blueprints, packages, and structured message schemas.

- [x] **Network Transport Plumbing**:
      Instantiating a `grpc.Server()`,
      binding interfaces securely on `0.0.0.0:50051`,
      and implementing insecure credentials for local development channels.

- [x] **Client Stubs**:
      Connecting directly to remote sockets using generated client wrappers
      rather than writing manual `fetch` calls.

- [x] **Separation of Concerns**:
      Correctly isolating network handlers (`server.ts`)
      from underlying core service business domain
      logic functions (`user.service.ts`).

- [x] **Auto-Generation & Strict Compilation**:
      Utilizing `protoc` and the `ts-proto` compiler plugin inside `package.json`
      to enforce 100% type-safety over naming casings and properties.

---

## Data & Streaming

- [ ] **Protobuf Data Types Reference**:
      _Learn how to handle arrays (`repeated`),
      key-value maps (`map<K,V>`),
      optional fields,
      how massive numbers match across systems._

- [ ] **Streaming Capabilities**:
      _Move past single request-response habits
      to handle real-time data flow pipelines._

- [ ] **Server Streaming**:
      _(Server pushes data chunks to client indefinitely
      over a single connection line—great
      for real-time notifications or monitoring data streams)._

- [ ] **Client Streaming**:
      _(Client fires chunks of binary or text data continuously upstream
      to the server—perfect for uploading large files safely)._

- [ ] **Bidirectional Streaming**:
      _(Both systems write concurrently to an open pipe socket
      channel—ideal for low-latency live chat systems)._

## Production Plumbing & Security

- [ ] **Production Plumbing**
      _Bridge the gap between basic localhost experiments
      and secure microservice clusters._

- [ ] **gRPC Metadata (Headers)**
      _Pass authentication parameters,
      authentication tokens,
      trace context variables across services using gRPC context objects._

- [ ] **Error Handling (Status Codes)**
      _Stop code crashes gracefully by returning standardized gRPC system
      error status codes (like `NOT_FOUND` or `UNAUTHENTICATED`)
      with helpful debug messages._

- [ ] **Interceptors (Middleware)**
      _Write reusable global interceptor wrappers to log every request
      or validate JWT signatures before routing
      traffic down to individual service methods._
