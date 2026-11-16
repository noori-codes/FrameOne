import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Prisma 7 + Supabase Postgres (standard pg pool + @prisma/adapter-pg).
 *
 * Use the Supabase *transaction pooler* URI (port 6543, ?pgbouncer=true) for
 * DATABASE_URL in the app. Use DIRECT_URL (port 5432) for `prisma migrate`.
 *
 * Keep `max` tiny against PgBouncer transaction mode — a large client pool
 * opens parallel server connections that get recycled mid-query
 * (“Connection terminated unexpectedly”).
 */
const PRISMA_SCHEMA_VERSION = 13;

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
      // One client connection; PgBouncer multiplexes the rest.
      max: 1,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 15_000,
      allowExitOnIdle: true,
    });

  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = pool;
    pool.on("error", (err) => {
      console.warn("pg pool error:", err.message);
    });
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
