import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 CLI config (migrate, generate, studio).
 * The connection string is here — not in schema.prisma anymore.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Relative to project root → prisma/dev.db
    url: env("DATABASE_URL"),
  },
});
