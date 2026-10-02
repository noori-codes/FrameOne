"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  toggleFavorite,
  type ToggleFavoriteState,
} from "@/app/actions/favorites";

type FavoriteButtonProps = {
  movieId: number;
  title: string;
  posterPath: string | null;
  initialFavorited: boolean;
  signedIn: boolean;
};

export function FavoriteButton({
  movieId,
  title,
  posterPath,
  initialFavorited,
  signedIn,
}: FavoriteButtonProps) {
  const [state, action, pending] = useActionState(
    toggleFavorite,
    { favorited: initialFavorited } satisfies ToggleFavoriteState,
  );

  const favorited = state.favorited ?? initialFavorited;

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
    <form action={action} className="mt-6">
      <input type="hidden" name="movieId" value={movieId} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="posterPath" value={posterPath ?? ""} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-cream/25 px-4 py-2 text-sm text-cream transition-colors hover:border-amber hover:text-amber disabled:opacity-60"
      >
        {pending
          ? "Saving…"
          : favorited
            ? "Remove from list"
            : "Add to my list"}
      </button>
      {state.error ? (
        <p className="mt-2 text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
