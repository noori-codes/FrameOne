"use client";

import { useActionState, useEffect } from "react";
import {
  updateFavoriteMeta,
  type FavoriteMetaState,
} from "@/app/actions/favorites";
import { cn } from "@/lib/utils";

type FavoriteMetaFormProps = {
  movieId: number;
  initialRating: number | null;
  initialNote: string | null;
  className?: string;
  onSuccess?: () => void;
};

const initial: FavoriteMetaState = {};

/**
 * Rate (1–10) + optional note for a saved favorite.
 * Only works after the movie is already on Favorites.
 */
export function FavoriteMetaForm({
  movieId,
  initialRating,
  initialNote,
  className,
  onSuccess,
}: FavoriteMetaFormProps) {
  const [state, action, pending] = useActionState(updateFavoriteMeta, initial);

  useEffect(() => {
    if (state.success) onSuccess?.();
  }, [state.success, onSuccess]);

  return (
    <form
      action={action}
      className={cn("flex w-full flex-col gap-3", className)}
    >
      <input type="hidden" name="movieId" value={movieId} />

      <label className="flex flex-col gap-1.5 text-sm text-cream/65">
        Your rating
        <select
          name="rating"
          defaultValue={initialRating ?? ""}
          className="rounded-full border border-cream/15 bg-background px-3 py-2 text-cream outline-none transition-[border-color,box-shadow] focus:border-amber/50 focus:ring-1 focus:ring-amber/60"
        >
          <option value="">Not rated</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} / 10
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-cream/65">
        Note
        <textarea
          name="note"
          rows={4}
          maxLength={280}
          defaultValue={initialNote ?? ""}
          placeholder="Why you saved this…"
          className="resize-y rounded-xl border border-cream/15 bg-background px-3 py-2 text-sm text-cream outline-none placeholder:text-cream/35 transition-[border-color,box-shadow] focus:border-amber/50 focus:ring-1 focus:ring-amber/60"
        />
      </label>

      {state.error ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-amber px-4 py-2 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
