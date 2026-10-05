import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaClient } from "@/lib/generated/prisma/client";
import ws from "ws";

/**
 * Prisma 7 + Neon serverless.
 *
 * PrismaNeon takes PoolConfig `{ connectionString }`, NOT a Pool instance.
 * Passing a Pool made the driver dial 127.0.0.1:443 → ECONNREFUSED and a
 * blank `{ clientVersion }` error on /profile.
 */
const PRISMA_SCHEMA_VERSION = 10; // v10: PrismaNeon(PoolConfig) fix

// Node needs an explicit WebSocket implementation for Neon WS
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion?: number;
};

function sanitizeNeonUrl(raw: string) {
  const url = new URL(raw);
  url.searchParams.delete("channel_binding");
  return url.toString();
}

function databaseUrl() {
  const raw =
    process.env.DATABASE_URL_POOLED?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!raw) {
    throw new Error(
      "Missing DATABASE_URL (or DATABASE_URL_POOLED). Add it to .env.local.",
    );
  }
  return sanitizeNeonUrl(raw);
}

function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString: databaseUrl() });
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
