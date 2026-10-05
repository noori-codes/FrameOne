import type { Session } from "next-auth";
import { auth } from "@/auth";
import { SiteNav } from "@/components/site-nav";

/**
 * Full-width sticky header. `auth()` reads the session cookie on the server.
 * Nav collapses into a menu on small screens.
 */
export async function SiteHeader() {
  let session: Session | null = null;
  try {
    session = (await auth()) as Session | null;
  } catch {
    // Bad/expired session cookie — show signed-out chrome instead of crashing
    session = null;
  }

  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }
    : null;

  return (
    <header className="sticky top-0 z-30 border-b border-cream/10 bg-background/90 backdrop-blur-md">
      <SiteNav user={user} />
    </header>
  );
}
