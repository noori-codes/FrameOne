import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js keeps secrets in .env.local; Prisma CLI needs them too.
config({ path: ".env.local" });
config();

function migrateUrl() {
  // Prefer DIRECT_URL (5432) for migrations; pooler (6543) often breaks migrate.
  // Placeholder is enough for `prisma generate` (no network); migrate needs a real URL.
  const raw =
    process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();

  if (!raw) {
    return "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
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
