"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useActionState, useOptimistic } from "react";
import { toggleList, type ToggleListState } from "@/app/actions/favorites";
import {
  LIST_FAVORITE,
  LIST_WATCHLIST,
  MEDIA_MOVIE,
  type ListType,
  type MediaListType,
} from "@/lib/lists";
import { cn } from "@/lib/utils";

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
  const [state, dispatch, pending] = useActionState(toggleList, {
    saved: initialSaved,
    listType,
  } satisfies ToggleListState);
  const saved = state.saved ?? initialSaved;
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);

  const buttonLabel = optimisticSaved ? activeLabel : idleLabel;

  function action(formData: FormData) {
    if (pending) return;
    setOptimisticSaved(!optimisticSaved);
    dispatch(formData);
  }

  return (
    <form action={action}>
      <input type="hidden" name="movieId" value={movieId} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="posterPath" value={posterPath ?? ""} />
      <input type="hidden" name="listType" value={listType} />
      <input type="hidden" name="mediaType" value={mediaType} />
      <button
        type="submit"
        aria-busy={pending}
        aria-label={buttonLabel}
        aria-pressed={optimisticSaved}
        className={cn(
          "transition-colors",
          iconOnly
            ? "inline-flex h-10 w-10 items-center justify-center rounded-full sm:h-11 sm:w-11"
            : "min-h-10 rounded-full px-3.5 py-2 text-xs sm:min-h-11 sm:px-4 sm:text-sm",
          optimisticSaved
            ? "border border-amber/50 bg-amber/10 text-amber hover:border-amber hover:bg-amber/15"
            : "border border-cream/25 text-cream hover:border-cream/45 hover:text-cream",
        )}
      >
        {iconOnly ? (
          <Heart
            aria-hidden="true"
            className="h-5 w-5"
            fill={optimisticSaved ? "currentColor" : "none"}
            strokeWidth={optimisticSaved ? 2.5 : 2}
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
