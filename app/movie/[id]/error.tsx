"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/error-view";

export default function MovieError({
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
      title="Couldn’t load this movie"
      message="TMDB may be slow or the title failed to load."
      reset={reset}
    />
  );
}
