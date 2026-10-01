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
 * We also drop a stale cache if it was created before a new model (e.g. Favorite).
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
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
  const cached = globalForPrisma.prisma;
  // After `prisma generate`, an old cached client can miss new models.
  if (cached && typeof cached.favorite?.findUnique === "function") {
    return cached;
  }
  return createPrismaClient();
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
