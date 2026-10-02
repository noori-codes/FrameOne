"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/error-view";

export default function GenreDetailError({
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
      title="Couldn’t load this genre"
      message="Movies for this genre failed to load from TMDB."
      reset={reset}
    />
  );
}
