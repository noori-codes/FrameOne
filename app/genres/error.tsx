"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/error-view";

export default function GenresError({
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
      title="Genres unavailable"
      message="We couldn’t load genres from TMDB."
      reset={reset}
    />
  );
}
