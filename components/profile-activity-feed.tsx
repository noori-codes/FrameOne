import Image from "next/image";
import Link from "next/link";
import { Check, Heart, ListVideo, Star } from "lucide-react";
import {
  formatActivityWhen,
  type ProfileActivityItem,
  type ProfileActivityKind,
} from "@/lib/profile-activity";
import { mediaHref } from "@/lib/lists";
import { posterUrl } from "@/lib/tmdb";

type ProfileActivityFeedProps = {
  items: ProfileActivityItem[];
};

function kindMeta(kind: ProfileActivityKind) {
  switch (kind) {
    case "watched":
      return {
        label: "Watched",
        icon: Check,
        className: "border-amber/30 bg-amber/10 text-amber",
      };
    case "rated":
      return {
        label: "Rated",
        icon: Star,
        className: "border-amber/30 bg-amber/10 text-amber",
      };
    case "favorited":
      return {
        label: "Favorited",
        icon: Heart,
        className: "border-red-400/25 bg-red-500/10 text-red-300",
      };
    case "watchlisted":
      return {
        label: "Watchlist",
        icon: ListVideo,
        className: "border-cream/20 bg-cream/5 text-cream/70",
      };
  }
}

/**
 * Chronological diary of saves, ratings, and watches on profile.
 */
export function ProfileActivityFeed({ items }: ProfileActivityFeedProps) {
  if (items.length === 0) {
    return (
      <section aria-labelledby="activity-heading" className="min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase">
          Recent
        </p>
        <h2
          id="activity-heading"
          className="mt-2 font-display text-2xl tracking-wide text-cream uppercase sm:text-3xl"
        >
          Activity
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/50">
          Rate a favorite, mark something watched, or add to your watchlist —
          it’ll show up here.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="activity-heading" className="min-w-0">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase">
            Recent
          </p>
          <h2
            id="activity-heading"
            className="mt-2 font-display text-2xl tracking-wide text-cream uppercase sm:text-3xl"
          >
            Activity
          </h2>
        </div>
        <p className="text-sm text-cream/40">{items.length} latest</p>
      </div>

      <ol className="mt-6 divide-y divide-cream/8 border-y border-cream/8">
        {items.map((item) => {
          const meta = kindMeta(item.kind);
          const Icon = meta.icon;
          const poster = posterUrl(item.posterPath, "w185");
          const href = mediaHref(item.mediaType, item.movieId);

          return (
            <li key={item.id}>
              <Link
                href={href}
                className="group flex items-center gap-3.5 py-3.5 transition-colors hover:bg-cream/[0.02] sm:gap-4 sm:py-4"
              >
                <div className="relative aspect-2/3 w-11 shrink-0 overflow-hidden rounded-lg bg-stage ring-1 ring-cream/10 sm:w-12">
                  {poster ? (
                    <Image
                      src={poster}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[10px] text-cream/35">
                      —
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase ${meta.className}`}
                    >
                      <Icon className="size-3" aria-hidden />
                      {meta.label}
                    </span>
                    <time
                      dateTime={item.at.toISOString()}
                      className="text-xs text-cream/40"
                    >
                      {formatActivityWhen(item.at)}
                    </time>
                  </div>
                  <p className="mt-1.5 truncate text-sm font-medium text-cream/90 transition-colors group-hover:text-amber">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-cream/40">
                    {item.mediaType === "tv" ? "Series" : "Film"}
                    {item.kind === "rated" && item.rating != null
                      ? ` · ${item.rating}/10`
                      : null}
                    {item.kind === "watched" &&
                    (item.rewatchCount ?? 0) > 0
                      ? ` · ${item.rewatchCount}× rewatch`
                      : null}
                    {item.note?.trim()
                      ? ` · “${item.note.trim().slice(0, 72)}${item.note.trim().length > 72 ? "…" : ""}”`
                      : null}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
