"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/error-view";

export default function TvError({
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
      title="Couldn’t load this series"
      message="TMDB may be slow or the title failed to load."
      reset={reset}
    />
  );
}
