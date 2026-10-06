"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useActionState } from "react";
import { toggleList, type ToggleListState } from "@/app/actions/favorites";
import { LIST_FAVORITE, LIST_WATCHLIST, type ListType } from "@/lib/lists";

type SaveListButtonsProps = {
  movieId: number;
  title: string;
  posterPath: string | null;
  initialFavorite: boolean;
  initialWatchlist: boolean;
  signedIn: boolean;
};

function ListToggle({
  movieId,
  title,
  posterPath,
  listType,
  initialSaved,
  activeLabel,
  idleLabel,
  iconOnly = false,
}: {
  movieId: number;
  title: string;
  posterPath: string | null;
  listType: ListType;
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
      <button
        type="submit"
        disabled={pending}
        aria-label={buttonLabel}
        className={
          iconOnly
            ? saved
              ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber/50 bg-amber/10 text-amber transition-colors hover:border-amber hover:bg-amber/15 disabled:opacity-60"
              : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 text-cream transition-colors hover:border-cream/45 hover:text-cream disabled:opacity-60"
            : saved
              ? "rounded-full border border-amber/50 bg-amber/10 px-4 py-2 text-sm text-amber transition-colors hover:border-amber hover:bg-amber/15 disabled:opacity-60"
              : "rounded-full border border-cream/25 px-4 py-2 text-sm text-cream transition-colors hover:border-cream/45 hover:text-cream disabled:opacity-60"
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
 * Favorites + Watchlist toggles on the movie detail page.
 * A movie can live in either list, both, or neither.
 */
export function SaveListButtons({
  movieId,
  title,
  posterPath,
  initialFavorite,
  initialWatchlist,
  signedIn,
}: SaveListButtonsProps) {
  if (!signedIn) {
    return (
      <Link
        href="/signin"
        className="mt-6 inline-flex rounded-full border border-cream/25 px-4 py-2 text-sm text-cream/80 transition-colors hover:border-amber hover:text-amber"
      >
        Sign in to save
      </Link>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <ListToggle
        key={`fav-${movieId}-${initialFavorite}`}
        movieId={movieId}
        title={title}
        posterPath={posterPath}
        listType={LIST_FAVORITE}
        initialSaved={initialFavorite}
        idleLabel="Favorite"
        activeLabel="Favorited"
        iconOnly
      />
      <ListToggle
        key={`wl-${movieId}-${initialWatchlist}`}
        movieId={movieId}
        title={title}
        posterPath={posterPath}
        listType={LIST_WATCHLIST}
        initialSaved={initialWatchlist}
        idleLabel="Add to watchlist"
        activeLabel="On watchlist"
      />
    </div>
  );
}
