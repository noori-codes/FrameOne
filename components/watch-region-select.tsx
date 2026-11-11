"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  WATCH_REGION_COOKIE,
  WATCH_REGIONS,
  type WatchRegionCode,
} from "@/lib/watch-region";
import { cn } from "@/lib/utils";

type WatchRegionSelectProps = {
  region: string;
  className?: string;
};

/**
 * Lets the user override JustWatch/TMDB availability region (cookie + refresh).
 */
export function WatchRegionSelect({
  region,
  className,
}: WatchRegionSelectProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    const code = next.toUpperCase() as WatchRegionCode;
    document.cookie = `${WATCH_REGION_COOKIE}=${code};path=/;max-age=31536000;samesite=lax`;
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 text-xs text-cream/45",
        className,
      )}
    >
      <span className="tracking-wide uppercase">Region</span>
      <select
        value={region}
        disabled={pending}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Watch availability region"
        className="rounded-md border border-cream/15 bg-black/40 px-2 py-1.5 text-xs font-medium text-cream/80 outline-none transition-[border-color,background-color] hover:border-cream/30 focus:border-amber/40 disabled:opacity-60"
      >
        {WATCH_REGIONS.map((r) => (
          <option key={r.code} value={r.code}>
            {r.code} · {r.label}
          </option>
        ))}
      </select>
    </label>
  );
}
