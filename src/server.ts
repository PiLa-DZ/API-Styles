import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import soap from "soap";
import type { IServices, ISoapServiceMethod } from "soap";
import { workouts } from "./data.js";

// 1. Explicitly type the operation function with the library's internal method schema type
const getWorkoutListHandler: ISoapServiceMethod = function (
  args: { userId: string },
  callback: any,
) {
  console.log(
    `📡 SOAP Action triggered! Fetching workouts for User ID: ${args.userId}`,
  );

  const userWorkouts = workouts
    .filter((w) => w.userId === args.userId)
    .map((w) => ({
      id: w.id,
      title: w.title,
      duration: w.duration,
    }));

  if (callback) {
    callback({
      workouts: userWorkouts,
    });
  }
};

// 2. Build the Service Map using our clean handler function
const soapService: IServices = {
  WorkoutSoapService: {
    WorkoutPort: {
      GetWorkoutList: getWorkoutListHandler,
    },
  },
};

// 3. Read our physical WSDL xml contract file from disk
const wsdlPath = join(process.cwd(), "src", "service.wsdl");
const wsdlXml = readFileSync(wsdlPath, "utf8");

// 4. Create a clean, native HTTP Server
const server = createServer((request, response) => {
  // NEW: Read and serve the frontend UI file when visiting the root path "/"
  if (request.url === "/") {
    try {
      const htmlPath = join(process.cwd(), "public", "index.html");
      const htmlContent = readFileSync(htmlPath, "utf8");

      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(htmlContent);
    } catch (err) {
      response.writeHead(500, { "Content-Type": "text/plain" });
      response.end("Error loading public/index.html file from disk.");
    }
    return;
  }

  response.writeHead(404);
  response.end();
});

// 5. Bind the soap engine middleware onto the server container
server.listen(4000, () => {
  soap.listen(server, "/soap", soapService, wsdlXml, () => {
    console.info(
      "🚀 SOAP Armored Train Server operating at http://localhost:4000/soap?wsdl",
    );
  });
});
