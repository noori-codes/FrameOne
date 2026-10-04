import Link from "next/link";
import { cn } from "@/lib/utils";

type ListPageNavProps = {
  active: "favorites" | "watchlist";
};

/** Tabs between Favorites and Watchlist collection pages. */
export function ListPageNav({ active }: ListPageNavProps) {
  return (
    <nav
      className="mt-6 flex gap-1 border-b border-cream/10"
      aria-label="Your lists"
    >
      <Link
        href="/favorites"
        className={cn(
          "-mb-px border-b-2 px-3 py-2 text-sm transition-colors",
          active === "favorites"
            ? "border-amber text-cream"
            : "border-transparent text-cream/50 hover:text-cream",
        )}
        aria-current={active === "favorites" ? "page" : undefined}
      >
        Favorites
      </Link>
      <Link
        href="/watchlist"
        className={cn(
          "-mb-px border-b-2 px-3 py-2 text-sm transition-colors",
          active === "watchlist"
            ? "border-amber text-cream"
            : "border-transparent text-cream/50 hover:text-cream",
        )}
        aria-current={active === "watchlist" ? "page" : undefined}
      >
        Watchlist
      </Link>
    </nav>
  );
}
