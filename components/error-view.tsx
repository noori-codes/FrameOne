"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

type ErrorViewProps = {
  title?: string;
  message?: string;
  reset?: () => void;
};

/**
 * Client UI for Next.js `error.tsx` files.
 * `error.tsx` must be a Client Component so it can offer a "Try again" button.
 */
export function ErrorView({
  title = "Something went wrong",
  message = "The page hit an error — often a network or TMDB issue. Try again in a moment.",
  reset,
}: ErrorViewProps) {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center px-6 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 h-64 bg-[radial-gradient(ellipse_at_30%_40%,color-mix(in_srgb,var(--amber)_12%,transparent),transparent_60%)]"
      />
      <BrandLogo size="md" className="mb-6" />
      <h1 className="font-display text-4xl tracking-wide text-cream uppercase sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-cream/60">{message}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {reset ? (
          <button
            type="button"
            onClick={reset}
            className="cta-shine group relative inline-flex min-h-11 items-center overflow-hidden rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-[color:var(--on-amber)] transition-[background-color,box-shadow,transform] hover:bg-(--amber-dim) hover:text-cream hover:shadow-[0_14px_40px_-14px_color-mix(in_srgb,var(--amber)_70%,transparent)] active:scale-[0.98]"
          >
            <span className="cta-shine-beam pointer-events-none absolute inset-0" />
            <span className="relative">Try again</span>
          </button>
        ) : null}
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border border-cream/20 bg-black/25 px-5 py-2.5 text-sm font-medium text-cream/85 backdrop-blur-md transition-[border-color,background-color,color] hover:border-cream/40 hover:bg-black/40 hover:text-cream"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
