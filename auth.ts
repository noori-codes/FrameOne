import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

/** Re-check deleted users at most once per day — not on every RSC `auth()` read. */
const USER_VERIFY_INTERVAL_MS = 24 * 60 * 60 * 1000;

function normalizeAvatar(
  userId: string,
  image: string | null | undefined,
): string | null {
  if (!image) return null;
  if (image.startsWith("/api/avatars/")) return image;
  return `/api/avatars/${userId}`;
}

/**
 * Auth.js (NextAuth v5) — Node runtime (API routes + Server Components).
 * Middleware uses `auth.config.ts` only so it stays Edge-safe.
 *
 * Session reads are JWT-only on the hot path. Prisma user lookups used to run
 * on every `auth()` (layout + home helpers) and serialized behind max:1 pool.
 */
const nextAuth = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        // Block sign-in until the email OTP is confirmed
        if (!user.emailVerified) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: normalizeAvatar(user.id, user.image),
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = normalizeAvatar(user.id, user.image) ?? token.picture;
        token.lastVerified = Date.now();
      }

      // Profile updates (name / avatar) call unstable_update()
      if (trigger === "update" && session?.user) {
        if ("name" in session.user) token.name = session.user.name;
        if ("image" in session.user) {
          token.picture =
            typeof session.user.image === "string" && token.sub
              ? normalizeAvatar(token.sub, session.user.image)
              : session.user.image;
        }
        if ("email" in session.user && session.user.email) {
          token.email = session.user.email;
        }
        token.lastVerified = Date.now();
      }

      // Occasional existence check (ghost sessions after DB wipe) — not every request.
      const lastVerified =
        typeof token.lastVerified === "number" ? token.lastVerified : 0;
      const dueForVerify =
        Boolean(token.sub) &&
        !user &&
        trigger !== "update" &&
        Date.now() - lastVerified > USER_VERIFY_INTERVAL_MS;

      if (dueForVerify && token.sub) {
        try {
          const exists = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { id: true },
          });
          if (!exists) return null;
          token.lastVerified = Date.now();
        } catch {
          // Keep token if DB is briefly unreachable
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!token?.sub) {
        return { ...session, user: undefined as never };
      }

      if (session.user) {
        session.user.id = token.sub;
        if (typeof token.name === "string") session.user.name = token.name;
        if (typeof token.email === "string") session.user.email = token.email;
        session.user.image =
          typeof token.picture === "string" ? token.picture : null;
      }
      return session;
    },
  },
});

export const { handlers, signIn, signOut, unstable_update } = nextAuth;

/** One session decode per React request — callers still share the same promise. */
export const auth = cache(nextAuth.auth);
