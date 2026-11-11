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
  { href: "/watched", label: "Watched", auth: true },
  { href: "/stats", label: "Stats", auth: true },
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

function useScrolled(threshold = 16) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const onScroll = () => onStoreChange();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    },
    () => window.scrollY > threshold,
    () => false,
  );
}

/**
 * Responsive header nav — floating glass bar that densifies on scroll.
 * Hidden on auth screens so the split layout can own the viewport.
 */
export function SiteNav({ user }: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const scrolled = useScrolled();
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
        if (
          !active ||
          active === first ||
          !dialogRef.current?.contains(active)
        ) {
          e.preventDefault();
          last.focus();
        }
      } else if (
        !active ||
        active === last ||
        !dialogRef.current?.contains(active)
      ) {
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
  const onHome = pathname === "/";

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
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={close}
            />
            <div className="absolute inset-x-0 top-0 overflow-hidden rounded-b-3xl border-b border-cream/10 bg-[linear-gradient(180deg,rgba(20,18,16,0.98),rgba(9,8,7,0.96))] px-5 pb-7 pt-[env(safe-area-inset-top)] shadow-[0_32px_64px_-28px_rgba(0,0,0,0.95)]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber/50 to-transparent"
              />
              <div className="flex h-14 items-center justify-between gap-3 sm:h-16">
                <p
                  id={titleId}
                  className="font-display text-lg tracking-[0.2em] text-cream uppercase"
                >
                  Menu
                </p>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-cream/12 bg-cream/[0.03] text-cream/70 transition-[border-color,color,background-color] hover:border-cream/30 hover:bg-cream/[0.06] hover:text-cream"
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>

              <nav className="mt-3 flex flex-col gap-1">
                {visibleLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "rounded-2xl px-4 py-3.5 text-base tracking-wide transition-[background-color,color,box-shadow]",
                      isActive(link.href)
                        ? "bg-amber/12 text-amber shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--amber)_22%,transparent)]"
                        : "text-cream/75 hover:bg-cream/[0.04] hover:text-cream",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <Link
                    href="/profile"
                    onClick={close}
                    className="rounded-2xl px-4 py-3.5 text-base tracking-wide text-cream/75 transition-[background-color,color] hover:bg-cream/[0.04] hover:text-cream"
                  >
                    Account
                  </Link>
                ) : (
                  <div className="mt-4 flex flex-col gap-2.5">
                    <Link
                      href="/signin"
                      onClick={close}
                      className="rounded-full border border-cream/15 bg-cream/[0.03] px-4 py-3 text-center text-sm font-medium text-cream transition-[border-color,background-color] hover:border-cream/35 hover:bg-cream/[0.06]"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={close}
                      className="cta-shine group relative overflow-hidden rounded-full bg-amber px-4 py-3 text-center text-sm font-semibold text-[color:var(--on-amber)] transition-[background-color,box-shadow] hover:bg-(--amber-dim) hover:text-cream"
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
          "site-header z-30 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          onHome ? "fixed inset-x-0 top-0" : "sticky top-0",
          scrolled || !onHome
            ? "border-b border-cream/8 bg-background/80 shadow-[0_18px_48px_-28px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
            : "border-b border-transparent bg-linear-to-b from-background/55 via-background/20 to-transparent backdrop-blur-md",
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-500",
            scrolled || !onHome ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="h-full w-full bg-linear-to-r from-transparent via-amber/45 to-transparent" />
        </div>

        <div className="relative flex h-14 w-full items-center gap-3 px-5 sm:h-16 sm:gap-4 sm:px-6 lg:px-8 xl:px-10">
          <Link
            href="/"
            className="group inline-flex h-full min-w-0 shrink items-center transition-opacity hover:opacity-90"
            aria-label="FrameOne home"
          >
            <BrandLogo
              size="sm"
              withWordmark
              priority
              className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop */}
          <div className="ml-auto hidden items-center gap-3 md:flex lg:gap-4">
            <nav
              aria-label="Main navigation"
              className="flex items-center gap-0.5 rounded-full border border-cream/10 bg-cream/[0.035] p-1 shadow-[inset_0_1px_0_color-mix(in_srgb,white_6%,transparent)] backdrop-blur-xl"
            >
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-wide transition-[color,background-color,box-shadow] duration-300",
                    isActive(link.href)
                      ? "bg-amber/15 text-amber shadow-[0_8px_24px_-14px_color-mix(in_srgb,var(--amber)_55%,transparent)]"
                      : "text-cream/65 hover:bg-cream/[0.05] hover:text-cream",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/search"
              aria-label="Search movies"
              aria-current={pathname === "/search" ? "page" : undefined}
              className={cn(
                "group inline-flex h-9 items-center gap-2 rounded-full border border-cream/10 bg-cream/[0.03] px-3 text-cream/65 transition-[border-color,background-color,color,box-shadow] duration-300 hover:border-cream/20 hover:bg-cream/[0.06] hover:text-cream",
                pathname === "/search" &&
                  "border-amber/25 bg-amber/10 text-amber shadow-[0_0_24px_-10px_color-mix(in_srgb,var(--amber)_50%,transparent)]",
              )}
            >
              <Search className="size-4 shrink-0" strokeWidth={1.75} />
              <span className="hidden text-[13px] font-medium tracking-wide lg:inline">
                Search
              </span>
            </Link>

            {user ? (
              <Link
                href="/profile"
                aria-label="Profile"
                title={user.name ?? user.email ?? "Profile"}
                className="group inline-flex size-9 shrink-0 items-center justify-center rounded-full outline-none transition-[box-shadow,transform] duration-300 hover:scale-[1.03] hover:ring-2 hover:ring-amber/35 hover:ring-offset-2 hover:ring-offset-background focus-visible:ring-2 focus-visible:ring-amber/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <UserAvatar
                  name={user.name}
                  email={user.email}
                  image={user.image}
                  size="sm"
                  className="size-9 border-cream/15 transition-[border-color] duration-300 group-hover:border-amber/50"
                />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/signin"
                  className="rounded-full px-3 py-1.5 text-[13px] font-medium tracking-wide text-cream/65 transition-colors duration-300 hover:text-cream"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="cta-shine group relative inline-flex min-h-9 items-center overflow-hidden rounded-full bg-amber px-4 text-[13px] font-semibold tracking-wide text-[color:var(--on-amber)] transition-[background-color,box-shadow,transform] duration-300 hover:bg-(--amber-dim) hover:text-cream hover:shadow-[0_12px_36px_-14px_color-mix(in_srgb,var(--amber)_70%,transparent)] active:scale-[0.98]"
                >
                  <span className="cta-shine-beam pointer-events-none absolute inset-0" />
                  <span className="relative">Join free</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="ml-auto flex items-center gap-1.5 md:hidden">
            <Link
              href="/search"
              aria-label="Search movies"
              className="inline-flex size-10 items-center justify-center rounded-full text-cream/70 transition-[color,background-color] hover:bg-cream/[0.05] hover:text-cream"
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </Link>
            {user ? (
              <Link
                href="/profile"
                aria-label="Profile"
                title={user.name ?? user.email ?? "Profile"}
                className="group inline-flex size-9 shrink-0 items-center justify-center rounded-full outline-none transition-[box-shadow] duration-300 hover:ring-2 hover:ring-amber/35 hover:ring-offset-2 hover:ring-offset-background focus-visible:ring-2 focus-visible:ring-amber/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <UserAvatar
                  name={user.name}
                  email={user.email}
                  image={user.image}
                  size="sm"
                  className="size-9 border-cream/15 transition-[border-color] group-hover:border-amber/50"
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
              className="inline-flex size-10 items-center justify-center rounded-full text-cream/70 transition-[color,background-color] hover:bg-cream/[0.05] hover:text-cream"
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
