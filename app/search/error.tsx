"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/error-view";

export default function SearchError({
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
      title="Search failed"
      message="We couldn’t finish that search. Try again."
      reset={reset}
    />
  );
}
