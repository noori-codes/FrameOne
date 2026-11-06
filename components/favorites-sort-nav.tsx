import Link from "next/link";
import { cn } from "@/lib/utils";

export type FavoritesSort = "recent" | "rating" | "title";

const SORTS: { id: FavoritesSort; label: string }[] = [
  { id: "recent", label: "Recent" },
  { id: "rating", label: "Highest rated" },
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
    <nav
      aria-label="Sort favorites"
      className="inline-flex flex-wrap gap-1 rounded-full border border-cream/10 bg-black/25 p-1 backdrop-blur-md"
    >
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
