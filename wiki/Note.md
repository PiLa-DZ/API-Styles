# Part 1: Which one is the most popular in the real world?

```
[API Style Popularity in Production]
█▓▒░ REST (JSON / HTTP)   🚀 [~85% - 90% of all public web apps]
█▓▒░ GraphQL              ✨ [~20% - 25% of modern frontend-heavy teams]
█▓▒░ gRPC                 ⚡ [~15% - 20% of backend microservices]
█▓▒░ SOAP                 🏛️ [~10% - 15% legacy corporate banking/enterprise]
```

---

## 1. Focus 80% of your energy on Deep REST + Clean Architecture

- **Strict Schema Validation:**
  Becoming an expert at using tools like **Zod**
  to validate incoming parameters before they ever touch your database logic.

- **Component-Based (Modular) Architecture:**
  Moving away from a simple "controllers/services/models" folder structure.
  Instead, organize your backend code into feature modules
  (e.g., an `auth` module, a `workout` module, an `exercise` module)
  where each folder contains its own routes, business logic, and tests.
  This makes your apps infinitely scalable.

- **Production Database Integrity:**
  Mastering how to use an ORM like **Prisma with MariaDB**
  to structure highly optimized relational tables,
  write manual transitions, handle database indexes for speed,
  and handle clean data seeding.

## 2. Master Automated Documentation (OpenAPI / Swagger)

In the modern tech industry,
**undocumented code is broken code.** \*
Do not write manual Markdown files to document routes.
Focus on learning how to write an OpenAPI YAML spec file
or using packages that automatically generate an OpenAPI spec
from your Express TypeScript definitions.

## 3. Keep GraphQL and gRPC as specialized tools in your toolkit

- **GraphQL:**
  You now understand its core mechanisms
  (Schemas, Queries, Mutations, and Resolvers).
  That is enough for 90% of interviews!
  If you want to push it further later,
  look into the **N+1 Problem** and how `DataLoader` solves it.

- **gRPC:**
  Don't worry about building large apps with it right now.
  Just remember its core definition:
  it's for high-speed binary server-to-server microservices.
