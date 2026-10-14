"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

const DISMISS_KEY = "frameone:guest-nudge-dismissed";

const HIDDEN_PATHS = [
  "/signin",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

/**
 * Fixed bottom bar for signed-out visitors — streaming-app pattern:
 * value prop + Sign in / Join, dismissible for the session.
 */
export function GuestAuthNudge() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // private mode / blocked storage — still show
    }
    setVisible(true);
  }, []);

  const onAuthPage = HIDDEN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const show = visible && !onAuthPage;

  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = "6.25rem";
    return () => {
      document.body.style.paddingBottom = prev;
    };
  }, [show]);

  if (!show) return null;

  function dismiss() {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  return (
    <div
      role="region"
      aria-label="Sign in to save titles"
      className="guest-nudge pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5"
    >
      <div className="guest-nudge-card pointer-events-auto relative mx-auto flex max-w-screen-2xl items-center gap-3 overflow-hidden rounded-2xl border border-cream/12 bg-[linear-gradient(118deg,rgba(16,22,23,0.94),rgba(7,10,11,0.9))] px-3.5 py-3.5 shadow-[0_-24px_60px_-28px_rgba(0,0,0,0.95),0_0_0_1px_color-mix(in_srgb,var(--amber)_8%,transparent)] backdrop-blur-2xl sm:gap-5 sm:px-6 sm:py-4">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-8 top-1/2 size-40 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--amber)_32%,transparent),transparent_68%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-transparent via-amber to-transparent opacity-80"
        />

        <div className="relative hidden size-10 shrink-0 items-center justify-center rounded-xl border border-amber/25 bg-amber/10 text-amber sm:flex">
          <Sparkles className="size-4" strokeWidth={1.75} />
        </div>

        <div className="relative min-w-0 flex-1 pl-1 sm:pl-0">
          <p className="truncate text-[10px] font-semibold tracking-[0.22em] text-amber uppercase sm:text-[11px]">
            Save your seat
          </p>
          <p className="mt-0.5 truncate text-sm text-cream/78 sm:text-[15px]">
            Keep favorites, a watchlist, and notes — free forever.
          </p>
        </div>

        <div className="relative flex shrink-0 items-center gap-2">
          <Link
            href="/signin"
            className="inline-flex min-h-9 items-center rounded-full border border-cream/20 bg-cream/[0.03] px-3.5 text-xs font-medium text-cream/90 transition-[border-color,background-color,color,transform] hover:border-cream/40 hover:bg-cream/[0.06] hover:text-cream active:scale-[0.98] sm:min-h-10 sm:px-4 sm:text-sm"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="cta-shine group relative inline-flex min-h-9 items-center overflow-hidden rounded-full bg-amber px-3.5 text-xs font-semibold text-[color:var(--on-amber)] transition-[background-color,box-shadow,transform] hover:bg-(--amber-dim) hover:text-cream hover:shadow-[0_12px_36px_-14px_color-mix(in_srgb,var(--amber)_70%,transparent)] active:scale-[0.98] sm:min-h-10 sm:px-4 sm:text-sm"
          >
            <span className="cta-shine-beam pointer-events-none absolute inset-0" />
            <span className="relative">Join free</span>
          </Link>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss sign-in prompt"
            className="ml-0.5 inline-flex size-8 items-center justify-center rounded-full text-cream/35 transition-colors hover:bg-cream/10 hover:text-cream/70 sm:size-9"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
