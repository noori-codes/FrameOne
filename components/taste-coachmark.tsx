"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "fo_taste_coach_dismissed";

type TasteCoachmarkProps = {
  /** Show when the user is signed in but hasn’t unlocked taste yet. */
  show: boolean;
};

/**
 * First-run strip — nudge new users to mark a few titles watched.
 */
export function TasteCoachmark({ show }: TasteCoachmarkProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }
    try {
      setVisible(window.localStorage.getItem(STORAGE_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, [show]);

  if (!visible) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  return (
    <aside
      aria-label="Get personalized rows"
      className="relative mx-5 overflow-hidden rounded-2xl border border-amber/25 bg-linear-to-r from-amber/12 via-cream/[0.03] to-transparent px-4 py-4 sm:mx-8 sm:px-5 sm:py-5 lg:mx-12 xl:mx-16"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full text-cream/45 transition-colors hover:bg-cream/5 hover:text-cream"
      >
        <X className="size-4" />
      </button>
      <p className="text-[10px] font-semibold tracking-[0.22em] text-amber uppercase">
        Unlock your night
      </p>
      <p className="mt-2 max-w-xl pr-8 text-sm leading-relaxed text-cream/75 sm:text-[15px]">
        Mark 3 titles watched (and rate a favorite) — we’ll replace the brochure
        rows with picks that feel like yours.
      </p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Link
          href="/search"
          className="inline-flex min-h-10 items-center rounded-md bg-amber px-4 text-sm font-semibold text-[color:var(--on-amber)] transition-colors hover:bg-(--amber-dim) hover:text-cream"
        >
          Find something to log
        </Link>
        <Link
          href="/watched"
          className="inline-flex min-h-10 items-center rounded-md border border-cream/20 bg-black/30 px-4 text-sm text-cream/75 transition-colors hover:border-cream/40 hover:text-cream"
        >
          Open diary
        </Link>
      </div>
    </aside>
  );
}
