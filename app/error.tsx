"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/error-view";

/**
 * Catches errors in this segment and below (not the root layout itself).
 * Next.js passes `error` + `reset` — reset re-renders the segment.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorView
      reset={reset}
      message={
        error.message?.includes("TMDB")
          ? "We couldn’t reach TMDB. Check your API key or connection, then try again."
          : undefined
      }
    />
  );
}
