import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

/**
 * Auth.js (NextAuth v5) — Node runtime (API routes + Server Components).
 * Middleware uses `auth.config.ts` only so it stays Edge-safe.
 */
export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
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
        token.picture = user.image ?? token.picture;
      }

      // Profile updates (name / avatar) call unstable_update()
      if (trigger === "update" && session?.user) {
        if ("name" in session.user) token.name = session.user.name;
        if ("image" in session.user) token.picture = session.user.image;
        if ("email" in session.user && session.user.email) {
          token.email = session.user.email;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (typeof token.name === "string") session.user.name = token.name;
        if (typeof token.email === "string") session.user.email = token.email;
        session.user.image =
          typeof token.picture === "string" ? token.picture : null;

        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { name: true, email: true, image: true },
          });
          if (dbUser) {
            session.user.name = dbUser.name;
            session.user.email = dbUser.email;
            // Rewrite legacy public S3 URLs (403) to the app proxy
            let image = dbUser.image;
            if (image && !image.startsWith("/api/avatars/")) {
              image = `/api/avatars/${token.sub}`;
              // Persist so we don't keep rewriting every request
              void prisma.user
                .update({
                  where: { id: token.sub },
                  data: { image },
                })
                .catch(() => undefined);
            }
            session.user.image = image;
          }
        } catch {
          // Keep JWT values if the database blips
        }
      }
      return session;
    },
  },
});
