import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

/**
 * Runs before protected pages load.
 * Uses edge-safe `authConfig` (not `auth.ts`) so Prisma/SQLite never runs on the Edge.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isLoggedIn = Boolean(req.auth?.user);
  const isProtected =
    pathname.startsWith("/favorites") ||
    pathname.startsWith("/watchlist") ||
    pathname.startsWith("/profile");
  const isAuthPage = pathname === "/signin" || pathname === "/signup";

  if (isProtected && !isLoggedIn) {
    const signInUrl = new URL("/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  // Already signed in — skip auth forms (unless JWT is stale; AUTH_SECRET rotation clears that)
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/favorites/:path*",
    "/watchlist/:path*",
    "/profile/:path*",
    "/signin",
    "/signup",
  ],
};
