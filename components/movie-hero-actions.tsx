import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { SaveListButtons } from "@/components/save-list-buttons";
import { TrailerButton } from "@/components/trailer-button";
import type { WatchProviderOffer } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

type MovieHeroActionsProps = {
  movieId: number;
  title: string;
  posterPath: string | null;
  trailerKey: string | null;
  watchOffer: WatchProviderOffer | null;
  initialFavorite: boolean;
  initialWatchlist: boolean;
  initialWatched: boolean;
  signedIn: boolean;
};

function primaryWatch(offer: WatchProviderOffer | null) {
  if (!offer?.link) return null;
  const provider =
    offer.free[0] ?? offer.flatrate[0] ?? offer.rent[0] ?? offer.buy[0];
  if (!provider) return null;
  const kind = offer.free[0]
    ? "Free"
    : offer.flatrate[0]
      ? "Stream"
      : offer.rent[0]
        ? "Rent"
        : "Buy";
  return { href: offer.link, name: provider.provider_name, kind };
}

/**
 * Hero CTA cluster — primary JustWatch link, trailer, then list toggles.
 */
export function MovieHeroActions({
  movieId,
  title,
  posterPath,
  trailerKey,
  watchOffer,
  initialFavorite,
  initialWatchlist,
  initialWatched,
  signedIn,
}: MovieHeroActionsProps) {
  const watch = primaryWatch(watchOffer);

  return (
    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
      {watch ? (
        <a
          href={watch.href}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "cta-shine group relative inline-flex min-h-10 items-center gap-2 overflow-hidden rounded-full bg-amber px-5 text-sm font-semibold text-[color:var(--on-amber)] shadow-[0_14px_36px_-16px_color-mix(in_srgb,var(--amber)_55%,transparent)] transition-[background-color,box-shadow,transform] hover:bg-(--amber-dim) hover:text-cream active:scale-[0.98] sm:min-h-12 sm:px-6",
          )}
        >
          <ExternalLink className="size-4" aria-hidden />
          <span>
            {watch.kind} on {watch.name}
          </span>
        </a>
      ) : null}

      {trailerKey ? (
        <TrailerButton
          youtubeKey={trailerKey}
          title={title}
          label="Trailer"
          variant={watch ? "ghost" : "primary"}
          className="min-h-10 px-5 text-sm sm:min-h-12 sm:px-6"
        />
      ) : null}

      <SaveListButtons
        key={`${movieId}-${initialFavorite}-${initialWatchlist}-${initialWatched}`}
        movieId={movieId}
        title={title}
        posterPath={posterPath}
        initialFavorite={initialFavorite}
        initialWatchlist={initialWatchlist}
        initialWatched={initialWatched}
        signedIn={signedIn}
      />

      {!signedIn && !watch && !trailerKey ? (
        <Link
          href="/signin"
          className="inline-flex min-h-10 items-center rounded-full border border-cream/20 bg-black/30 px-3.5 text-xs font-medium text-cream/85 backdrop-blur-md sm:min-h-11 sm:px-4 sm:text-sm"
        >
          Sign in to save
        </Link>
      ) : null}
    </div>
  );
}
