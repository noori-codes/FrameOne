import Link from "next/link";
import { cn } from "@/lib/utils";

export type WatchedSort = "recent" | "title";

const SORTS: { id: WatchedSort; label: string }[] = [
  { id: "recent", label: "Recent" },
  { id: "title", label: "A–Z" },
];

export function parseWatchedSort(
  raw: string | undefined | null,
): WatchedSort {
  if (raw === "title" || raw === "recent") return raw;
  return "recent";
}

type WatchedSortNavProps = {
  active: WatchedSort;
};

export function WatchedSortNav({ active }: WatchedSortNavProps) {
  return (
    <nav
      aria-label="Sort watched"
      className="inline-flex flex-wrap gap-1 rounded-full border border-cream/10 bg-black/25 p-1 backdrop-blur-md"
    >
      {SORTS.map((sort) => {
        const href =
          sort.id === "recent" ? "/watched" : `/watched?sort=${sort.id}`;
        const isActive = sort.id === active;

        return (
          <Link
            key={sort.id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm transition-[background-color,color] duration-300",
              isActive
                ? "bg-cream/10 text-cream"
                : "text-cream/45 hover:text-cream/80",
            )}
          >
            {sort.label}
          </Link>
        );
      })}
    </nav>
  );
}
