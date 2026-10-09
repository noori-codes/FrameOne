"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useActionState } from "react";
import { toggleList, type ToggleListState } from "@/app/actions/favorites";
import {
  LIST_FAVORITE,
  LIST_WATCHLIST,
  MEDIA_MOVIE,
  type ListType,
  type MediaListType,
} from "@/lib/lists";

type SaveListButtonsProps = {
  movieId: number;
  title: string;
  posterPath: string | null;
  initialFavorite: boolean;
  initialWatchlist: boolean;
  signedIn: boolean;
  mediaType?: MediaListType;
};

function ListToggle({
  movieId,
  title,
  posterPath,
  listType,
  mediaType,
  initialSaved,
  activeLabel,
  idleLabel,
  iconOnly = false,
}: {
  movieId: number;
  title: string;
  posterPath: string | null;
  listType: ListType;
  mediaType: MediaListType;
  initialSaved: boolean;
  activeLabel: string;
  idleLabel: string;
  iconOnly?: boolean;
}) {
  const [state, action, pending] = useActionState(toggleList, {
    saved: initialSaved,
    listType,
  } satisfies ToggleListState);
  const saved = state.saved ?? initialSaved;

  const buttonLabel = pending ? "Saving…" : saved ? activeLabel : idleLabel;

  return (
    <form action={action}>
      <input type="hidden" name="movieId" value={movieId} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="posterPath" value={posterPath ?? ""} />
      <input type="hidden" name="listType" value={listType} />
      <input type="hidden" name="mediaType" value={mediaType} />
      <button
        type="submit"
        disabled={pending}
        aria-label={buttonLabel}
        className={
          iconOnly
            ? saved
              ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber/50 bg-amber/10 text-amber transition-colors hover:border-amber hover:bg-amber/15 disabled:opacity-60 sm:h-11 sm:w-11"
              : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/25 text-cream transition-colors hover:border-cream/45 hover:text-cream disabled:opacity-60 sm:h-11 sm:w-11"
            : saved
              ? "min-h-10 rounded-full border border-amber/50 bg-amber/10 px-3.5 py-2 text-xs text-amber transition-colors hover:border-amber hover:bg-amber/15 disabled:opacity-60 sm:min-h-11 sm:px-4 sm:text-sm"
              : "min-h-10 rounded-full border border-cream/25 px-3.5 py-2 text-xs text-cream transition-colors hover:border-cream/45 hover:text-cream disabled:opacity-60 sm:min-h-11 sm:px-4 sm:text-sm"
        }
      >
        {iconOnly ? (
          <Heart
            aria-hidden="true"
            className="h-5 w-5"
            fill={saved ? "currentColor" : "none"}
            strokeWidth={saved ? 2.5 : 2}
          />
        ) : (
          buttonLabel
        )}
      </button>
      {state.error ? (
        <p className="mt-2 text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

/**
 * Favorites + Watchlist toggles on movie / TV detail pages.
 */
export function SaveListButtons({
  movieId,
  title,
  posterPath,
  initialFavorite,
  initialWatchlist,
  signedIn,
  mediaType = MEDIA_MOVIE,
}: SaveListButtonsProps) {
  if (!signedIn) {
    return (
      <Link
        href="/signin"
        className="inline-flex min-h-10 items-center rounded-full border border-cream/25 px-3.5 py-2 text-xs text-cream/80 transition-colors hover:border-amber hover:text-amber sm:min-h-11 sm:px-4 sm:text-sm"
      >
        Sign in to save
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <ListToggle
        key={`fav-${mediaType}-${movieId}-${initialFavorite}`}
        movieId={movieId}
        title={title}
        posterPath={posterPath}
        listType={LIST_FAVORITE}
        mediaType={mediaType}
        initialSaved={initialFavorite}
        idleLabel="Favorite"
        activeLabel="Favorited"
        iconOnly
      />
      <ListToggle
        key={`wl-${mediaType}-${movieId}-${initialWatchlist}`}
        movieId={movieId}
        title={title}
        posterPath={posterPath}
        listType={LIST_WATCHLIST}
        mediaType={mediaType}
        initialSaved={initialWatchlist}
        idleLabel="Add to watchlist"
        activeLabel="On watchlist"
      />
    </div>
  );
}
