"use client";

import { Check, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import {
  toggleList,
  toggleWatched,
  type ToggleListState,
} from "@/app/actions/favorites";
import {
  LIST_WATCHLIST,
  MEDIA_MOVIE,
  mediaHref,
  type MediaListType,
} from "@/lib/lists";
import { posterUrl } from "@/lib/tmdb";

export type WatchlistCardData = {
  id: string;
  movieId: number;
  title: string;
  posterPath: string | null;
  mediaType?: MediaListType;
};

type WatchlistCardProps = {
  item: WatchlistCardData;
  priority?: boolean;
  /** 1-based queue position for the “Up next” feel. */
  queueIndex?: number;
};

const removeInitial: ToggleListState = {};
const watchedInitial: ToggleListState = {};

/**
 * Letterboxd-style watchlist tile — poster-first; hover reveals mark watched / remove.
 */
export function WatchlistCard({
  item,
  priority = false,
  queueIndex,
}: WatchlistCardProps) {
  const [, removeAction, removing] = useActionState(toggleList, removeInitial);
  const [, watchedAction, marking] = useActionState(
    toggleWatched,
    watchedInitial,
  );
  const poster = posterUrl(item.posterPath, "w500");
  const mediaType = item.mediaType ?? MEDIA_MOVIE;
  const href = mediaHref(mediaType, item.movieId);

  return (
    <li className="group relative">
      <Link
        href={href}
        className="relative block aspect-2/3 overflow-hidden rounded-xl bg-stage ring-1 ring-cream/10 transition-[transform,box-shadow,ring-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:-translate-y-1 group-hover:shadow-[0_28px_48px_-18px_rgba(0,0,0,0.85),0_0_40px_-16px_color-mix(in_srgb,var(--amber)_30%,transparent)] group-hover:ring-amber/35"
      >
        {poster ? (
          <Image
            src={poster}
            alt={item.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, (max-width: 1280px) 16vw, 12vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-[1.06]"
          />
        ) : (
          <span className="flex h-full items-center justify-center bg-stage p-3 text-center text-xs leading-snug text-cream/45">
            {item.title}
          </span>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/35 to-transparent px-2.5 pt-12 pb-2.5 transition-opacity duration-300 group-hover:opacity-0">
          <div className="flex items-center justify-between gap-2">
            {queueIndex != null ? (
              <span className="font-display text-lg leading-none tracking-wide text-cream/70">
                {String(queueIndex).padStart(2, "0")}
              </span>
            ) : (
              <span />
            )}
            <span className="rounded-full border border-cream/15 bg-black/50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-cream/80 uppercase backdrop-blur-md">
              {mediaType === "tv" ? "Series" : "Film"}
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black via-black/70 to-black/10 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
          {queueIndex != null ? (
            <p className="text-[10px] font-semibold tracking-[0.18em] text-amber uppercase">
              Queue {String(queueIndex).padStart(2, "0")}
            </p>
          ) : null}
          <p className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug text-cream">
            {item.title}
          </p>
          <p className="mt-1 text-[11px] tracking-wide text-cream/45 uppercase">
            {mediaType === "tv" ? "Series" : "Film"}
          </p>
        </div>
      </Link>

      <div className="pointer-events-none absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <form action={watchedAction}>
          <input type="hidden" name="movieId" value={item.movieId} />
          <input type="hidden" name="title" value={item.title} />
          <input type="hidden" name="mediaType" value={mediaType} />
          <input
            type="hidden"
            name="posterPath"
            value={item.posterPath ?? ""}
          />
          <button
            type="submit"
            disabled={marking}
            aria-label={`Mark ${item.title} as watched`}
            className="flex size-8 items-center justify-center rounded-full border border-cream/15 bg-black/65 text-cream/85 backdrop-blur-md transition-[border-color,background-color,color] hover:border-amber/45 hover:bg-amber/15 hover:text-amber disabled:opacity-60"
          >
            <Check className="size-3.5" strokeWidth={2.5} />
          </button>
        </form>
        <form action={removeAction}>
          <input type="hidden" name="listType" value={LIST_WATCHLIST} />
          <input type="hidden" name="movieId" value={item.movieId} />
          <input type="hidden" name="title" value={item.title} />
          <input type="hidden" name="mediaType" value={mediaType} />
          <input
            type="hidden"
            name="posterPath"
            value={item.posterPath ?? ""}
          />
          <button
            type="submit"
            disabled={removing}
            aria-label={`Remove ${item.title} from watchlist`}
            className="flex size-8 items-center justify-center rounded-full border border-cream/15 bg-black/65 text-cream/70 backdrop-blur-md transition-[border-color,background-color,color] hover:border-red-400/40 hover:bg-red-500/15 hover:text-red-300 disabled:opacity-60"
          >
            <Trash2 className="size-3.5" />
          </button>
        </form>
      </div>
    </li>
  );
}
