"use client";

import { Home, Search, Clapperboard, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const AUTH_PATHS = new Set([
  "/signin",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
]);

const tabs = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/search",
    label: "Search",
    icon: Search,
    match: (p: string) => p.startsWith("/search"),
  },
  {
    href: "/watched",
    label: "Watched",
    icon: Clapperboard,
    match: (p: string) => p.startsWith("/watched"),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserRound,
    match: (p: string) => p.startsWith("/profile") || p.startsWith("/signin"),
  },
] as const;

/**
 * Thumb-first habit bar — phone only. Desktop keeps the top nav.
 */
export function MobileTabBar() {
  const pathname = usePathname();

  // Auth screens + detail pages (sticky action rail owns the bottom).
  if (
    AUTH_PATHS.has(pathname) ||
    pathname.startsWith("/movie/") ||
    pathname.startsWith("/tv/")
  ) {
    return null;
  }

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-cream/10 bg-background/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl md:hidden"
    >
      <ul className="grid grid-cols-4">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium tracking-wide uppercase transition-colors",
                  active ? "text-amber" : "text-cream/50 hover:text-cream/80",
                )}
              >
                <Icon
                  className="size-5"
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden
                />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
