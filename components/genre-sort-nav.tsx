import Link from "next/link";
import { cn } from "@/lib/utils";
import { GENRE_SORTS, type GenreSort } from "@/lib/tmdb";

type GenreSortNavProps = {
  genreId: number;
  active: GenreSort;
};

/**
 * Popular / Top rated / Newest — server links (resets infinite scroll).
 */
export function GenreSortNav({ genreId, active }: GenreSortNavProps) {
  return (
    <nav aria-label="Sort genre results" className="flex flex-wrap gap-2">
      {GENRE_SORTS.map((sort) => {
        const href =
          sort.id === "popular"
            ? `/genres/${genreId}`
            : `/genres/${genreId}?sort=${sort.id}`;
        const isActive = sort.id === active;

        return (
          <Link
            key={sort.id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-amber text-[#1a1208]"
                : "border border-cream/15 text-cream/60 hover:border-amber/50 hover:text-amber",
            )}
          >
            {sort.label}
          </Link>
        );
      })}
    </nav>
  );
}
