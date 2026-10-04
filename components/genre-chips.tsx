import Link from "next/link";
import { cn } from "@/lib/utils";
import type { GenreSort, TmdbGenre } from "@/lib/tmdb";

type GenreChipsProps = {
  genres: TmdbGenre[];
  activeId?: number;
  /** Preserve current sort when switching genres. */
  sort?: GenreSort;
  className?: string;
};

/**
 * Horizontal genre switcher — active chip is highlighted.
 */
export function GenreChips({
  genres,
  activeId,
  sort = "popular",
  className,
}: GenreChipsProps) {
  return (
    <ul
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {genres.map((g) => {
        const active = g.id === activeId;
        const href =
          sort === "popular"
            ? `/genres/${g.id}`
            : `/genres/${g.id}?sort=${sort}`;

        return (
          <li key={g.id} className="shrink-0">
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                active
                  ? "border-amber/60 bg-amber/10 text-amber"
                  : "border-cream/12 bg-background/40 text-cream/60 hover:border-amber/50 hover:text-amber",
              )}
            >
              {g.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
