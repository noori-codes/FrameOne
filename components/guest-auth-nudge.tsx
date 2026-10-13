"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "frameone:guest-nudge-dismissed";

const HIDDEN_PATHS = ["/signin", "/signup", "/verify-email"];

/**
 * Fixed bottom bar for signed-out visitors — same pattern as streaming apps:
 * short value prop + Sign in / Sign up, dismissible for the session.
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
    document.body.style.paddingBottom = "5.75rem";
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
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4"
    >
      <div className="pointer-events-auto mx-auto flex max-w-screen-2xl items-center gap-3 overflow-hidden rounded-sm border border-cream/15 bg-[linear-gradient(105deg,rgba(16,22,23,0.97),rgba(7,10,11,0.94))] px-3 py-3 shadow-[0_-20px_50px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:gap-4 sm:px-5 sm:py-3.5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_50%,rgba(229,37,53,0.18),transparent_55%)]"
        />

        <div className="relative min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold tracking-[0.2em] text-amber uppercase sm:text-xs">
            Save your seat
          </p>
          <p className="mt-0.5 truncate text-sm text-cream/80 sm:text-[15px]">
            Sign in to keep favorites, a watchlist, and personal notes.
          </p>
        </div>

        <div className="relative flex shrink-0 items-center gap-2">
          <Link
            href="/signin"
            className="inline-flex min-h-9 items-center rounded-full border border-cream/25 px-3.5 text-xs font-medium text-cream/90 transition-colors hover:border-cream/45 hover:text-cream sm:min-h-10 sm:px-4 sm:text-sm"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-9 items-center rounded-full bg-amber px-3.5 text-xs font-medium text-[color:var(--on-amber)] transition-colors hover:bg-(--amber-dim) sm:min-h-10 sm:px-4 sm:text-sm"
          >
            Join free
          </Link>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss sign-in prompt"
            className="ml-0.5 inline-flex size-8 items-center justify-center rounded-full text-cream/40 transition-colors hover:bg-cream/10 hover:text-cream/70 sm:size-9"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
