import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config (no Prisma, no bcrypt).
 * Used by middleware. Full providers + DB live in `auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/signin",
  },
  session: { strategy: "jwt" },
  providers: [],
  // Stale cookies after AUTH_SECRET rotation log JWTSessionError then self-clear.
  // Don't spam the Next.js overlay / terminal for that expected case.
  logger: {
    error(error) {
      if (error.name === "JWTSessionError") return;
      console.error(error);
    },
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isProtected =
        pathname.startsWith("/favorites") ||
        pathname.startsWith("/watchlist") ||
        pathname.startsWith("/profile");

      if (isProtected) {
        return Boolean(auth?.user);
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
