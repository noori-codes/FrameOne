import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Prisma 7 needs a "driver adapter" to talk to the database.
 * better-sqlite3 reads/writes the local .db file on your disk.
 *
 * timestampFormat: our existing prisma/dev.db was created with Prisma 6,
 * which stored dates as unix ms — keep that format so old rows still work.
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

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
