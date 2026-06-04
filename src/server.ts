import { createSchema, createYoga } from "graphql-yoga";
import { createServer } from "node:http";
import { users, workouts } from "./data.js"; // NOTE: the .js extension required by nodenext
import { join } from "node:path";
import { promises as fsPromises } from "node:fs";

// 1. Define your Type Schema Contract
const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    name: String!
    email: String!
    workouts: [Workout!]! # Relational field: A user has an array of workouts
  }

  type Workout {
    id: ID!
    title: String!
    duration: Int!
    user: User! # Relational field: Every workout belongs to one User
  }

  type Query {
    hello: String!
    allUsers: [User!]!
    allWorkouts: [Workout!]!
    user(id: ID!): User # Fetch a specific user by their unique ID
  }
`;

// 2. Implement the Resolver Functions
const resolvers = {
  Query: {
    hello: () => "Hello from the GraphQL sandbox!",
    allUsers: () => users,
    allWorkouts: () => workouts,
    user: (_parent: unknown, args: { id: string }) => {
      return users.find((u) => u.id === args.id) || null;
    },
  },

  // 3. Define Relationship Resolvers
  User: {
    // This function executes whenever a client query asks for "workouts" inside a User
    workouts: (parentUser: { id: string }) => {
      return workouts.filter((w) => w.userId === parentUser.id);
    },
  },

  Workout: {
    // This function executes whenever a client query asks for the "user" inside a Workout
    user: (parentWorkout: { userId: string }) => {
      const foundUser = users.find((u) => u.id === parentWorkout.userId);
      if (!foundUser) {
        throw new Error(
          `Data corruption: User ${parentWorkout.userId} not found`,
        );
      }
      return foundUser;
    },
  },
};

const schema = createSchema({ typeDefs, resolvers });

// Initialize the GraphQL Yoga Engine with custom static file handling
const yoga = createYoga({
  schema,
  landingPage: false, // Disables the default landing page so we can render our own UI
});

const server = createServer(async (req, res) => {
  // If the user visits the root page http://localhost:4000/ serve the HTML file
  if (req.url === "/" || req.url === "/index.html") {
    try {
      const indexPath = join(process.cwd(), "public", "index.html");
      const htmlContent = await fsPromises.readFile(indexPath, "utf-8");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(htmlContent);
      return;
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error: Missing index.html in public directory");
      return;
    }
  }

  // Otherwise, hand the request over to the standard GraphQL Yoga execution layer
  await yoga(req, res);
});

server.listen(4000, () => {
  console.info("🚀 Server running at http://localhost:4000");
  console.info("📊 GraphQL engine operating at http://localhost:4000/graphql");
});
