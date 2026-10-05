import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Prisma 7 + Supabase Postgres (standard pg pool + @prisma/adapter-pg).
 *
 * Use the Supabase *transaction pooler* URI (port 6543, ?pgbouncer=true) for
 * DATABASE_URL in the app. Use DIRECT_URL (port 5432) for `prisma migrate`.
 */
const PRISMA_SCHEMA_VERSION = 11;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion?: number;
  pgPool?: Pool;
};

function databaseUrl() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    throw new Error(
      "Missing DATABASE_URL. In Supabase: Settings → Database → Connection string → URI (pooler for the app).",
    );
  }
  return raw;
}

function createPrismaClient() {
  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString: databaseUrl(),
      ssl: { rejectUnauthorized: false },
    });

  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = pool;
  }

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
