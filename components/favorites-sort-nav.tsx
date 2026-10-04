import Link from "next/link";
import { cn } from "@/lib/utils";

export type FavoritesSort = "recent" | "rating" | "title";

const SORTS: { id: FavoritesSort; label: string }[] = [
  { id: "recent", label: "Recent" },
  { id: "rating", label: "Your rating" },
  { id: "title", label: "A–Z" },
];

export function parseFavoritesSort(
  raw: string | undefined | null,
): FavoritesSort {
  if (raw === "rating" || raw === "title" || raw === "recent") return raw;
  return "recent";
}

type FavoritesSortNavProps = {
  active: FavoritesSort;
};

export function FavoritesSortNav({ active }: FavoritesSortNavProps) {
  return (
    <nav aria-label="Sort favorites" className="flex flex-wrap gap-2">
      {SORTS.map((sort) => {
        const href =
          sort.id === "recent" ? "/favorites" : `/favorites?sort=${sort.id}`;
        const isActive = sort.id === active;

        return (
          <Link
            key={sort.id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm transition-colors",
              isActive
                ? "border border-amber/50 bg-amber/10 text-amber"
                : "border border-cream/12 text-cream/50 hover:border-amber/40 hover:text-amber",
            )}
          >
            {sort.label}
          </Link>
        );
      })}
    </nav>
  );
}
