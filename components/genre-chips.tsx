import Link from "next/link";
import { cn } from "@/lib/utils";
import type { GenreSort, TmdbGenre } from "@/lib/tmdb";

type GenreChipsProps = {
  genres: TmdbGenre[];
  activeId?: number;
  /** Preserve current sort when switching genres. */
  sort?: GenreSort;
  /** Horizontal scroll rail (default) or vertical sidebar list. */
  orientation?: "horizontal" | "vertical";
  className?: string;
};

/**
 * Genre switcher — horizontal rail or vertical sidebar list.
 */
export function GenreChips({
  genres,
  activeId,
  sort = "popular",
  orientation = "horizontal",
  className,
}: GenreChipsProps) {
  const vertical = orientation === "vertical";

  return (
    <ul
      className={cn(
        vertical
          ? "flex flex-col gap-0.5"
          : "flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
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
          <li key={g.id} className={vertical ? undefined : "shrink-0"}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "font-medium tracking-wide transition-[color,background-color,box-shadow,border-color] duration-300",
                vertical
                  ? cn(
                      "flex w-full items-center rounded-xl px-3 py-2 text-sm",
                      active
                        ? "bg-amber/12 text-amber shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--amber)_22%,transparent)]"
                        : "text-cream/55 hover:bg-cream/[0.04] hover:text-cream",
                    )
                  : cn(
                      "inline-flex rounded-full px-3.5 py-1.5 text-[13px]",
                      active
                        ? "bg-amber/15 text-amber shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--amber)_28%,transparent)]"
                        : "border border-cream/10 bg-cream/[0.03] text-cream/55 hover:border-cream/20 hover:bg-cream/[0.06] hover:text-cream",
                    ),
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
