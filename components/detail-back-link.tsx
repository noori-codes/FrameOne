"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type DetailBackLinkProps = {
  fallbackHref?: string;
  label?: string;
};

/**
 * Prefers browser history when available; otherwise falls back to a safe href.
 */
export function DetailBackLink({
  fallbackHref = "/",
  label = "Back",
}: DetailBackLinkProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
          return;
        }
        router.push(fallbackHref);
      }}
      className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-cream/15 bg-black/25 px-3.5 text-xs font-medium text-cream/75 backdrop-blur-md transition-[border-color,color,background-color] hover:border-amber/40 hover:bg-black/40 hover:text-amber sm:text-sm"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {label}
    </button>
  );
}
