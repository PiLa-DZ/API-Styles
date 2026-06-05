```bash
npm install soap

# NOTE:
# We don't even need Express here;
# the soap library hooks directly into Node’s native node:http server package!
```

```
API-Styles/
├── public/
│   └── index.html    <-- Frontend to trigger raw XML requests
├── src/
│   ├── data.ts       <-- Your existing mock data arrays
│   ├── server.ts     <-- Our main Node.js HTTP SOAP server
│   └── service.wsdl  <-- The strict contract file (The blueprint)
```
