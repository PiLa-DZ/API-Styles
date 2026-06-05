# How to run the code

```bash
# 1. Start your Lesson 2 microservice server in your server pane:
npx tsx watch ./src/Lesson-02/service.ts

# 2. Run your client listener script in your client pane:
npx tsx ./src/Lesson-02/client.ts
```

---

## Summary

- Protocol Buffers `fileName.proto`
  - syntax `proto3`
  - package `packageName`
  - message `string, int32, repeated name`
  - service `rpc serviceName (inputs) returns (outputs)`
