import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js keeps secrets in .env.local; Prisma CLI needs them too.
config({ path: ".env.local" });
config();

function migrateUrl() {
  const raw = env("DATABASE_URL");
  try {
    const url = new URL(raw);
    url.searchParams.delete("channel_binding");
    url.searchParams.set("sslmode", "require");
    url.searchParams.set("uselibpqcompat", "true");
    return url.toString();
  } catch {
    return raw;
  }
}

/**
 * Prisma 7 CLI config (migrate, generate, studio).
 * Use the direct (non-pooled) Neon URL for migrations.
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
