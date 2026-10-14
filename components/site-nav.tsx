"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
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
  { href: "/", label: "Home" },
  { href: "/genres", label: "Genres" },
  { href: "/favorites", label: "Favorites", auth: true },
  { href: "/watchlist", label: "Watchlist", auth: true },
] as const;

const AUTH_PATHS = new Set([
  "/signin",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
]);

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Responsive header nav — compact bar on small screens, full links from md up.
 * Hidden on auth screens so the split layout can own the viewport.
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
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef(false);

  useEffect(() => {
    if (!open) {
      if (restoreFocusRef.current) {
        restoreFocusRef.current = false;
        menuTriggerRef.current?.focus();
      }
      return;
    }

    restoreFocusRef.current = true;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close control after paint so the portal is in the tree.
    const focusId = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    function getFocusable() {
      const root = dialogRef.current;
      if (!root) return [] as HTMLElement[];
      return Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (el) =>
          !el.hasAttribute("disabled") &&
          el.getAttribute("aria-hidden") !== "true" &&
          el.tabIndex !== -1,
      );
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first || !dialogRef.current?.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (!active || active === last || !dialogRef.current?.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(focusId);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  if (AUTH_PATHS.has(pathname)) {
    return null;
  }

  const visibleLinks = links.filter((l) => !("auth" in l && l.auth) || user);
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const menu =
    open && isClient
      ? createPortal(
          <div
            ref={dialogRef}
            className="fixed inset-0 z-50 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <button
              type="button"
              tabIndex={-1}
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
                  ref={closeButtonRef}
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
                  <div className="mt-3 flex flex-col gap-2">
                    <Link
                      href="/signin"
                      onClick={close}
                      className="rounded-full border border-cream/20 px-4 py-2.5 text-center text-sm text-cream transition-colors hover:border-cream/40 hover:text-cream"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={close}
                      className="cta-shine group relative overflow-hidden rounded-full bg-amber px-4 py-2.5 text-center text-sm font-semibold text-[color:var(--on-amber)] transition-[background-color,box-shadow] hover:bg-(--amber-dim) hover:text-cream"
                    >
                      <span className="cta-shine-beam pointer-events-none absolute inset-0" />
                      <span className="relative">Join free</span>
                    </Link>
                  </div>
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
          "site-header z-30 border-b border-cream/8 bg-background/70 shadow-[0_12px_40px_-22px_rgba(0,0,0,0.95)] backdrop-blur-2xl",
          pathname === "/" ? "fixed inset-x-0 top-0" : "sticky top-0",
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
          <div className="ml-auto hidden items-center gap-5 md:flex">
            <Link
              href="/search"
              aria-label="Search movies"
              aria-current={pathname === "/search" ? "page" : undefined}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-full transition-[color,background-color,box-shadow]",
                pathname === "/search"
                  ? "bg-amber/12 text-amber shadow-[0_0_24px_-8px_color-mix(in_srgb,var(--amber)_55%,transparent)]"
                  : "text-cream/60 hover:bg-cream/5 hover:text-cream",
              )}
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </Link>
            <nav
              aria-label="Main navigation"
              className="flex items-center gap-1.5 text-sm"
            >
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 transition-[color,background-color,box-shadow]",
                    isActive(link.href)
                      ? "bg-amber/12 text-amber shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--amber)_28%,transparent)]"
                      : "text-cream/70 hover:bg-cream/5 hover:text-cream",
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
                className="rounded-full ring-offset-2 ring-offset-background transition-[opacity,box-shadow] hover:opacity-90 hover:ring-2 hover:ring-amber/40"
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
              <div className="flex items-center gap-2.5">
                <Link
                  href="/signin"
                  className="text-sm text-cream/70 transition-colors hover:text-cream"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="cta-shine group relative inline-flex min-h-9 items-center overflow-hidden rounded-full bg-amber px-3.5 text-sm font-semibold text-[color:var(--on-amber)] transition-[background-color,box-shadow,transform] hover:bg-(--amber-dim) hover:text-cream hover:shadow-[0_12px_36px_-14px_color-mix(in_srgb,var(--amber)_70%,transparent)] active:scale-[0.98]"
                >
                  <span className="cta-shine-beam pointer-events-none absolute inset-0" />
                  <span className="relative">Join free</span>
                </Link>
              </div>
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
            ) : (
              <Link
                href="/signup"
                className="cta-shine group relative mr-0.5 inline-flex min-h-8 items-center overflow-hidden rounded-full bg-amber px-3 text-xs font-semibold text-[color:var(--on-amber)] transition-[background-color,box-shadow] hover:bg-(--amber-dim) hover:text-cream"
              >
                <span className="cta-shine-beam pointer-events-none absolute inset-0" />
                <span className="relative">Join</span>
              </Link>
            )}
            <button
              ref={menuTriggerRef}
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
