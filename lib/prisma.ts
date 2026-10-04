import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Prisma 7 needs a "driver adapter" to talk to the database.
 * better-sqlite3 reads/writes the local .db file on your disk.
 *
 * timestampFormat: our existing prisma/dev.db was created with Prisma 6,
 * which stored dates as unix ms — keep that format so old rows still work.
 *
 * In Next.js dev, a global cache avoids opening too many connections on hot reload.
 * Bump PRISMA_SCHEMA_VERSION whenever the schema gains fields/models so the
 * cached client is discarded (otherwise you get “Unknown argument …” errors).
 */
const PRISMA_SCHEMA_VERSION = 2; // v2: Favorite.listType (favorites vs watchlist)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion?: number;
};

function createPrismaClient() {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  const adapter = new PrismaBetterSqlite3(
    { url: `file:${dbPath}` },
    { timestampFormat: "unixepoch-ms" },
  );
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
