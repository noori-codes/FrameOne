import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Prisma 7 + Neon Postgres.
 * App runtime prefers the pooled URL (DATABASE_URL_POOLED) for serverless-friendly
 * connections; migrations use the direct DATABASE_URL via prisma.config.ts.
 *
 * Bump PRISMA_SCHEMA_VERSION when the schema changes so the Next.js global
 * cache discards a stale client.
 */
const PRISMA_SCHEMA_VERSION = 5; // v5: Neon Postgres adapter

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPool: Pool | undefined;
  prismaSchemaVersion?: number;
};

function databaseUrl() {
  const url =
    process.env.DATABASE_URL_POOLED?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "Missing DATABASE_URL (or DATABASE_URL_POOLED). Add it to .env.local.",
    );
  }
  return url;
}

function createPrismaClient() {
  const pool =
    globalForPrisma.prismaPool ??
    new Pool({
      connectionString: databaseUrl(),
      // Neon pooler + serverless: keep the pool small in the app process
      max: 10,
    });
  globalForPrisma.prismaPool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function getPrismaClient() {
  if (
    globalForPrisma.prisma &&
    globalForPrisma.prismaSchemaVersion === PRISMA_SCHEMA_VERSION
  ) {
    return globalForPrisma.prisma;
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
  return client;
}

export const prisma = getPrismaClient();
