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
      <BrandLogo size="md" className="mb-6" />
      <h1 className="font-display text-4xl tracking-wide text-cream sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-cream/60">{message}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {reset ? (
          <button
            type="button"
            onClick={reset}
            className="rounded-sm bg-amber px-5 py-2.5 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream"
          >
            Try again
          </button>
        ) : null}
        <Link
          href="/"
          className="rounded-sm border border-cream/20 px-5 py-2.5 text-sm text-cream/80 transition-colors hover:border-cream/40 hover:text-cream"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
