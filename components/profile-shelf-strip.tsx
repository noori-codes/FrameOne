import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { mediaHref, type MediaListType } from "@/lib/lists";
import { posterUrl } from "@/lib/tmdb";

export type ShelfItem = {
  id: string;
  movieId: number;
  title: string;
  posterPath: string | null;
  mediaType: MediaListType;
};

type ProfileShelfStripProps = {
  title: string;
  href: string;
  count: number;
  emptyLabel: string;
  items: ShelfItem[];
};

/**
 * Horizontal poster strip for profile — Letterboxd-style collection peek.
 */
export function ProfileShelfStrip({
  title,
  href,
  count,
  emptyLabel,
  items,
}: ProfileShelfStripProps) {
  return (
    <section className="min-w-0">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl tracking-tight text-cream sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-cream/45">
            {count > 0
              ? `${count} title${count === 1 ? "" : "s"}`
              : emptyLabel}
          </p>
        </div>
        <Link
          href={href}
          className="group inline-flex items-center gap-1 text-sm text-cream/50 transition-colors hover:text-amber"
        >
          See all
          <ArrowUpRight
            className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </Link>
      </div>

      {items.length > 0 ? (
        <ul className="mt-5 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3.5 [&::-webkit-scrollbar]:hidden">
          {items.map((item, i) => {
            const poster = posterUrl(item.posterPath, "w342");
            return (
              <li key={item.id} className="w-[7.25rem] shrink-0 sm:w-32">
                <Link
                  href={mediaHref(item.mediaType, item.movieId)}
                  className="group/card relative block aspect-2/3 overflow-hidden rounded-xl bg-stage ring-1 ring-cream/10 transition-[transform,box-shadow,ring-color] duration-500 hover:-translate-y-1 hover:shadow-[0_24px_40px_-18px_rgba(0,0,0,0.85)] hover:ring-amber/35"
                >
                  {poster ? (
                    <Image
                      src={poster}
                      alt={item.title}
                      fill
                      sizes="128px"
                      priority={i < 4}
                      className="object-cover transition-transform duration-700 group-hover/card:scale-[1.05]"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center p-2 text-center text-[11px] text-cream/45">
                      {item.title}
                    </span>
                  )}
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 to-transparent px-2 pt-8 pb-2 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                    <span className="line-clamp-2 text-[11px] font-medium leading-snug text-cream">
                      {item.title}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <Link
          href={href === "/favorites" ? "/search" : "/search"}
          className="mt-5 flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-cream/12 bg-cream/[0.02] px-6 text-center text-sm text-cream/40 transition-colors hover:border-amber/30 hover:text-amber"
        >
          {emptyLabel} — browse to add some
        </Link>
      )}
    </section>
  );
}
