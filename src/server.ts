import { createSchema, createYoga } from "graphql-yoga";
import { createServer } from "node:http";
import { users, workouts, mutationUtils } from "./data.js";
import { join } from "node:path";
import { promises as fsPromises } from "node:fs";

// 1. Updated Type Schema Contract with mutations
const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    name: String!
    email: String!
    workouts: [Workout!]!
  }

  type Workout {
    id: ID!
    title: String!
    duration: Int!
    user: User!
  }

  type Query {
    hello: String!
    allUsers: [User!]!
    allWorkouts: [Workout!]!
    user(id: ID!): User
  }

  # The entry points for modifying state data (C, U, D)
  type Mutation {
    createWorkout(userId: ID!, title: String!, duration: Int!): Workout!
    updateWorkout(id: ID!, title: String!, duration: Int!): Workout
    deleteWorkout(id: ID!): Workout
  }
`;

// 2. Updated Resolver Functions
const resolvers = {
  Query: {
    hello: () => "Hello from the GraphQL sandbox!",
    allUsers: () => users,
    allWorkouts: () => workouts,
    user: (_parent: unknown, args: { id: string }) => {
      return users.find((u) => u.id === args.id) || null;
    },
  },

  Mutation: {
    createWorkout: (
      _parent: unknown,
      args: { userId: string; title: string; duration: number },
    ) => {
      const newWorkout = {
        id: `w-${Date.now()}`, // Simple dynamic string ID
        userId: args.userId,
        title: args.title,
        duration: args.duration,
      };
      mutationUtils.addWorkout(newWorkout);
      return newWorkout;
    },

    updateWorkout: (
      _parent: unknown,
      args: { id: string; title: string; duration: number },
    ) => {
      const updated = mutationUtils.updateWorkout(
        args.id,
        args.title,
        args.duration,
      );
      if (!updated) throw new Error("Workout target not found");
      return updated;
    },

    deleteWorkout: (_parent: unknown, args: { id: string }) => {
      const deleted = mutationUtils.deleteWorkout(args.id);
      if (!deleted) throw new Error("Workout target not found");
      return deleted;
    },
  },

  User: {
    workouts: (parentUser: { id: string }) => {
      return workouts.filter((w) => w.userId === parentUser.id);
    },
  },

  Workout: {
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

const yoga = createYoga({
  schema,
  landingPage: false,
});

const server = createServer(async (req, res) => {
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
  await yoga(req, res);
});

server.listen(4000, () => {
  console.info("🚀 Server running at http://localhost:4000");
  console.info("📊 GraphQL engine operating at http://localhost:4000/graphql");
});
