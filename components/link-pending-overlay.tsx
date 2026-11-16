"use client";

import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";

type LinkPendingOverlayProps = {
  className?: string;
  /** Soft delay so fast navigations don’t flash. */
  delayMs?: number;
};

/**
 * Must render inside a Next.js `<Link>`. Shows pending chrome before the URL updates.
 */
export function LinkPendingOverlay({
  className,
  delayMs = 0,
}: LinkPendingOverlayProps) {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-[2] rounded-[inherit] bg-black/50 opacity-0",
        pending && "link-pending-overlay opacity-100",
        className,
      )}
      style={
        pending && delayMs > 0
          ? { animationDelay: `${delayMs}ms` }
          : undefined
      }
    >
      <span className="absolute inset-0 animate-pulse bg-amber/15" />
      <span className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-cream/25 border-t-amber" />
    </span>
  );
}
