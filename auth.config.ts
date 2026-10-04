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
