import Link from "next/link";
import { cn } from "@/lib/utils";

type ListPageNavProps = {
  active: "favorites" | "watchlist" | "watched";
};

/** Segmented control between Favorites, Watchlist, and Watched. */
export function ListPageNav({ active }: ListPageNavProps) {
  const items = [
    { id: "favorites" as const, href: "/favorites", label: "Favorites" },
    { id: "watchlist" as const, href: "/watchlist", label: "Watchlist" },
    { id: "watched" as const, href: "/watched", label: "Watched" },
  ];

  return (
    <nav
      aria-label="Your lists"
      className="inline-flex flex-wrap rounded-full border border-cream/12 bg-black/35 p-1 backdrop-blur-md"
    >
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm transition-[background-color,color,box-shadow] duration-300 sm:px-4",
            active === item.id
              ? "bg-amber text-[color:var(--on-amber)] shadow-[0_8px_24px_-12px_color-mix(in_srgb,var(--amber)_70%,transparent)]"
              : "text-cream/55 hover:text-cream",
          )}
          aria-current={active === item.id ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
