import Link from "next/link";
import { cn } from "@/lib/utils";

type ListPageNavProps = {
  active: "favorites" | "watchlist";
};

/** Pills between Favorites and Watchlist. */
export function ListPageNav({ active }: ListPageNavProps) {
  return (
    <nav aria-label="Your lists" className="flex flex-wrap gap-2">
      <Link
        href="/favorites"
        className={cn(
          "rounded-full px-3.5 py-1.5 text-sm transition-colors",
          active === "favorites"
            ? "bg-amber text-[#1a1208]"
            : "border border-cream/15 text-cream/60 hover:border-amber/50 hover:text-amber",
        )}
        aria-current={active === "favorites" ? "page" : undefined}
      >
        Favorites
      </Link>
      <Link
        href="/watchlist"
        className={cn(
          "rounded-full px-3.5 py-1.5 text-sm transition-colors",
          active === "watchlist"
            ? "bg-amber text-[#1a1208]"
            : "border border-cream/15 text-cream/60 hover:border-amber/50 hover:text-amber",
        )}
        aria-current={active === "watchlist" ? "page" : undefined}
      >
        Watchlist
      </Link>
    </nav>
  );
}
