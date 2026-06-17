# gRPC

- Protocol Buffers or `Protobuf`
- Streaming
  - Server-streaming RPCs
  - Client-streaming RPCs
  - Bidirectional-streaming RPCs
- HTTP/2
  - Binary Framing Layer:
  - Streaming:
  - Flow Control:
  - Header Compression:
  - Processing:
- Channels

---

- In 2015, Google developed gRPC as an extension of the RPC framework
- HTTP/2

---

## Protocol Buffers or `Protobuf`

- Easy definition of services and auto-generation of client libraries.
- gRPC uses this protocol as their Interface Definition Language `IDL` and serialization toolset.
- current version is `proto3`, which has the latest features and is easier to use.

- gRPC services and messages between clients and servers are defined in proto files.
- The Protobuf compiler, protoc, generates client and server code that loads the .proto file
  into the memory at runtime and uses the in-memory schema to serialize/deserialize the binary message.
  After code generation, each message is exchanged between the client and remote service.

- Protobuf offers some great benefits over JSON and XML.
  Parsing with Protobuf requires fewer CPU resources since data is converted
  into a binary format, and encoded messages are lighter in size.
  So, messages are exchanged faster, even in machines with a slower CPU,
  such as mobile devices.

---

## Streaming

Streaming is another key concept of gRPC,
where many processes can take place in a single request.
The multiplexing capability
(sending multiple responses or receiving multiple requests together over a single TCP connection)
of HTTP/2 makes it possible.
Here are the main types of streaming:

- Server-streaming RPCs:
  The client sends a single request to the server and receives back a stream of data sequences.
  The sequence is preserved, and server messages continuously stream until there are no messages left.

- Client-streaming RPCs:
  The client sends a stream of data sequences to the server,
  which then processes and returns a single response to the client. Once again,
  gRPC guarantees message sequencing within an independent RPC call.

- Bidirectional-streaming RPCs:
  It is two-way streaming where both client and server sends a sequence of messages to each other.
  Both streams operate independently; thus, they can transmit messages in any sequence.
  The sequence of messages in each stream is preserved.

---

## HTTP/2

gRPC is developed on HTTP/2,
which was published in 2015 to overcome the HTTP/1.1 limitations.
While it is compatible with HTTP/1.1,
HTTP/2 brings many advanced capabilities, such as:

- Binary Framing Layer:
  Unlike HTTP/1.1,
  HTTP/2 request/response is divided into small messages and framed in binary format,
  making message transmission efficient. With binary framing,
  the HTTP/2 protocol has made request/response multiplexing possible
  without blocking network resources.

- Streaming:
  Bidirectional full-duplex streaming in which the client can request
  and the server can respond simultaneously.

- Flow Control:
  Flow control mechanism is used in HTTP/2,
  enabling detailed control of memory used to buffer in-flight messages.

- Header Compression:
  Everything in HTTP/2, including headers, is encoded before sending,
  significantly improving overall performance.
  Using the HPACK compression method,
  HTTP/2 only shares the value different from the previous HTTP header packets.

- Processing:
  With HTTP/2, gRPC supports both synchronous and asynchronous processing,
  which can be used to perform different types of interaction and streaming RPCs.

All these features of HTTP/2 enable gRPC to use fewer resources,
resulting in reduced response times between apps and services running in the cloud
and longer battery life for a client running mobile devices.

## Channels

Channels are a core concept in gRPC.
The HTTP/2 streams allow many simultaneous streams on one connection;
channels extend this concept by supporting multiple streams over multiple concurrent connections.
They provide a way to connect to the gRPC server on a specified address
and port and are used in creating a client stub.
