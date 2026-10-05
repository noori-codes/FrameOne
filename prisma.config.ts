import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js keeps secrets in .env.local; Prisma CLI needs them too.
config({ path: ".env.local" });
config();

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
    url: env("DATABASE_URL"),
  },
});
