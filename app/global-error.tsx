"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/error-view";

/** Last resort — replaces the root layout when it crashes. */
export default function GlobalError({
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
    <html lang="en">
      <body className="min-h-dvh bg-[#0c0b0a] text-[#f3efe6] antialiased">
        <ErrorView
          title="App error"
          message="A top-level error occurred. Try reloading."
          reset={reset}
        />
      </body>
    </html>
  );
}
