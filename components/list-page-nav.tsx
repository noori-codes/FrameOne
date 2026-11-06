import Link from "next/link";
import { cn } from "@/lib/utils";

type ListPageNavProps = {
  active: "favorites" | "watchlist";
};

/** Segmented control between Favorites and Watchlist. */
export function ListPageNav({ active }: ListPageNavProps) {
  return (
    <nav
      aria-label="Your lists"
      className="inline-flex rounded-full border border-cream/12 bg-black/35 p-1 backdrop-blur-md"
    >
      <Link
        href="/favorites"
        className={cn(
          "rounded-full px-4 py-1.5 text-sm transition-[background-color,color,box-shadow] duration-300",
          active === "favorites"
            ? "bg-amber text-[color:var(--on-amber)] shadow-[0_8px_24px_-12px_color-mix(in_srgb,var(--amber)_70%,transparent)]"
            : "text-cream/55 hover:text-cream",
        )}
        aria-current={active === "favorites" ? "page" : undefined}
      >
        Favorites
      </Link>
      <Link
        href="/watchlist"
        className={cn(
          "rounded-full px-4 py-1.5 text-sm transition-[background-color,color,box-shadow] duration-300",
          active === "watchlist"
            ? "bg-amber text-[color:var(--on-amber)] shadow-[0_8px_24px_-12px_color-mix(in_srgb,var(--amber)_70%,transparent)]"
            : "text-cream/55 hover:text-cream",
        )}
        aria-current={active === "watchlist" ? "page" : undefined}
      >
        Watchlist
      </Link>
    </nav>
  );
}
