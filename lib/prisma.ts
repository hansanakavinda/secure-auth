import { PrismaClient } from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// 1. Setup the connection pool (Prisma 7 uses native JS drivers)
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 2. Define the Singleton using the global object
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 3. In Prisma 7, you MUST pass the adapter to the constructor
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    // log: ['query'] // Optional: useful for debugging in dev
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;