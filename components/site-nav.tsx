"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { BrandLogo } from "@/components/brand-logo";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

export type SiteNavUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type SiteNavProps = {
  user: SiteNavUser | null;
};

const links = [
  { href: "/", label: "Browse" },
  { href: "/genres", label: "Genres" },
  { href: "/favorites", label: "Favorites", auth: true },
  { href: "/watchlist", label: "Watchlist", auth: true },
] as const;

/**
 * Responsive header nav — compact bar on small screens, full links from md up.
 */
export function SiteNav({ user }: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  const visibleLinks = links.filter((l) => !("auth" in l && l.auth) || user);
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const menu =
    open && isClient
      ? createPortal(
          <div
            className="fixed inset-0 z-50 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={close}
            />
            <div className="absolute inset-x-0 top-0 border-b border-cream/10 bg-background/95 px-4 pb-6 pt-[env(safe-area-inset-top)] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.9)]">
              <div className="flex h-14 items-center justify-between gap-3">
                <p
                  id={titleId}
                  className="font-display text-lg tracking-[0.18em] text-cream uppercase"
                >
                  Menu
                </p>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="rounded-full border border-cream/20 p-2 text-cream/70 transition-colors hover:border-cream/40 hover:text-cream"
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>

              <nav className="mt-2 flex flex-col gap-1">
                {visibleLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "rounded-lg px-3 py-3 text-base transition-colors hover:bg-cream/5 hover:text-cream",
                      isActive(link.href)
                        ? "bg-amber/10 text-amber"
                        : "text-cream/80",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <Link
                    href="/profile"
                    onClick={close}
                    className="rounded-lg px-3 py-3 text-base text-cream/80 transition-colors hover:bg-cream/5 hover:text-cream"
                  >
                    Account
                  </Link>
                ) : (
                  <Link
                    href="/signin"
                    onClick={close}
                    className="mt-2 rounded-full border border-cream/20 px-4 py-2.5 text-center text-sm text-cream transition-colors hover:border-amber hover:text-amber"
                  >
                    Sign in
                  </Link>
                )}
              </nav>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <header
        className={cn(
          "z-30 border-b border-cream/10 bg-background/25 backdrop-blur-xl",
          pathname === "/"
            ? "fixed inset-x-0 top-0"
            : "sticky top-0",
        )}
      >
      <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex h-full min-w-0 shrink items-center transition-opacity hover:opacity-90"
          aria-label="FrameOne home"
        >
          <BrandLogo size="sm" withWordmark priority />
        </Link>
        {/* Desktop links */}
        <div className="ml-auto hidden items-center gap-6 md:flex">
          <Link
            href="/search"
            aria-label="Search movies"
            aria-current={pathname === "/search" ? "page" : undefined}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full transition-colors",
              pathname === "/search"
                ? "text-amber"
                : "text-cream/60 hover:bg-cream/5 hover:text-cream",
            )}
          >
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-6 text-sm">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "border-b-2 border-transparent py-2 transition-colors",
                  isActive(link.href)
                    ? "border-amber text-amber"
                    : "text-cream/65 hover:text-cream",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {user ? (
            <Link
              href="/profile"
              aria-label="Profile"
              title={user.name ?? user.email ?? "Profile"}
              className="rounded-full transition-opacity hover:opacity-80"
            >
              <UserAvatar
                name={user.name}
                email={user.email}
                image={user.image}
                size="sm"
                className="hover:border-amber"
              />
            </Link>
          ) : (
            <Link
              href="/signin"
              className="text-sm text-cream/75 transition-colors hover:text-amber"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile actions */}
        <div className="ml-auto flex items-center gap-1.5 md:hidden">
          <Link
            href="/search"
            aria-label="Search movies"
            className="rounded-full p-2.5 text-cream/70 transition-colors hover:bg-cream/5 hover:text-cream"
          >
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </Link>
          {user ? (
            <Link
              href="/profile"
              aria-label="Profile"
              title={user.name ?? user.email ?? "Profile"}
              className="rounded-full p-0.5 transition-opacity hover:opacity-90"
            >
              <UserAvatar
                name={user.name}
                email={user.email}
                image={user.image}
                size="sm"
                className="hover:border-amber"
              />
            </Link>
          ) : null}
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="rounded-full p-2.5 text-cream/70 transition-colors hover:bg-cream/5 hover:text-cream"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
      </header>
      {menu}
    </>
  );
}
