import Link from "next/link";
import { cn } from "@/lib/utils";
import { GENRE_SORTS, type GenreSort } from "@/lib/tmdb";

type GenreSortNavProps = {
  genreId: number;
  active: GenreSort;
  className?: string;
};

/**
 * Popular / Top rated / Newest — glass capsule group.
 */
export function GenreSortNav({
  genreId,
  active,
  className,
}: GenreSortNavProps) {
  return (
    <nav
      aria-label="Sort genre results"
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-cream/10 bg-cream/[0.035] p-1 shadow-[inset_0_1px_0_color-mix(in_srgb,white_6%,transparent)]",
        className,
      )}
    >
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
              "rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-wide transition-[color,background-color,box-shadow] duration-300",
              isActive
                ? "bg-amber/15 text-amber shadow-[0_8px_24px_-14px_color-mix(in_srgb,var(--amber)_55%,transparent)]"
                : "text-cream/55 hover:bg-cream/[0.05] hover:text-cream",
            )}
          >
            {sort.label}
          </Link>
        );
      })}
    </nav>
  );
}
