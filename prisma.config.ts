import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js keeps secrets in .env.local; Prisma CLI needs them too.
config({ path: ".env.local" });
config();

function migrateUrl() {
  // Prefer DIRECT_URL (5432) for migrations; pooler (6543) often breaks migrate
  const raw =
    process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();

  if (!raw) {
    throw new Error(
      "Missing DATABASE_URL (and DIRECT_URL). Uncomment/add them in .env.local — Supabase Dashboard → Database → Connect → Prisma.",
    );
  }

  try {
    const url = new URL(raw);
    url.searchParams.delete("channel_binding");
    if (!url.searchParams.has("sslmode")) {
      url.searchParams.set("sslmode", "require");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

/**
 * Prisma 7 CLI config (migrate, generate, studio).
 * Set DIRECT_URL to Supabase “Session mode” / direct Postgres (port 5432).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrateUrl(),
  },
});
