import Link from "next/link";
import { cn } from "@/lib/utils";

export type WatchedRange = "all" | "week" | "month";
export type WatchedListSort = "recent" | "title";

const RANGES: { id: WatchedRange; label: string }[] = [
  { id: "all", label: "All" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

export function parseWatchedRange(
  raw: string | undefined | null,
): WatchedRange {
  if (raw === "week" || raw === "month" || raw === "all") return raw;
  return "all";
}

/** Inclusive lower bound for diary range filters (local calendar). */
export function watchedRangeStart(range: WatchedRange): Date | null {
  if (range === "all") return null;
  const now = new Date();
  if (range === "week") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    return start;
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function watchedListHref(
  sort: WatchedListSort,
  range: WatchedRange,
) {
  const params = new URLSearchParams();
  if (sort !== "recent") params.set("sort", sort);
  if (range !== "all") params.set("range", range);
  const q = params.toString();
  return q ? `/watched?${q}` : "/watched";
}

type WatchedRangeNavProps = {
  active: WatchedRange;
  sort: WatchedListSort;
};

export function WatchedRangeNav({ active, sort }: WatchedRangeNavProps) {
  return (
    <nav
      aria-label="Diary range"
      className="inline-flex flex-wrap gap-1 rounded-full border border-cream/10 bg-black/25 p-1 backdrop-blur-md"
    >
      {RANGES.map((range) => {
        const isActive = range.id === active;
        return (
          <Link
            key={range.id}
            href={watchedListHref(sort, range.id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm transition-[background-color,color] duration-300",
              isActive
                ? "bg-cream/10 text-cream"
                : "text-cream/45 hover:text-cream/80",
            )}
          >
            {range.label}
          </Link>
        );
      })}
    </nav>
  );
}
