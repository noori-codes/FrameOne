"use client";

import { useActionState } from "react";
import {
  updateFavoriteMeta,
  type FavoriteMetaState,
} from "@/app/actions/favorites";

type FavoriteMetaFormProps = {
  movieId: number;
  initialRating: number | null;
  initialNote: string | null;
  /** Compact layout for the favorites grid cards. */
  compact?: boolean;
};

const initial: FavoriteMetaState = {};

/**
 * Rate (1–10) + optional note for a saved favorite.
 * Only works after the movie is already on My list.
 */
export function FavoriteMetaForm({
  movieId,
  initialRating,
  initialNote,
  compact = false,
}: FavoriteMetaFormProps) {
  const [state, action, pending] = useActionState(updateFavoriteMeta, initial);

  return (
    <form
      action={action}
      className={
        compact
          ? "mt-3 flex flex-col gap-2"
          : "mt-6 flex max-w-md flex-col gap-3"
      }
    >
      <input type="hidden" name="movieId" value={movieId} />

      <label className="flex flex-col gap-1.5 text-sm text-cream/65">
        Your rating
        <select
          name="rating"
          defaultValue={initialRating ?? ""}
          className="rounded-full border border-cream/15 bg-stage px-3 py-2 text-cream outline-none transition-[border-color,box-shadow] focus:border-amber/50 focus:ring-1 focus:ring-amber/60"
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
          rows={compact ? 2 : 3}
          maxLength={280}
          defaultValue={initialNote ?? ""}
          placeholder="Why you saved this…"
          className="resize-y rounded-xl border border-cream/15 bg-stage px-3 py-2 text-sm text-cream outline-none placeholder:text-cream/35 transition-[border-color,box-shadow] focus:border-amber/50 focus:ring-1 focus:ring-amber/60"
        />
      </label>

      {state.error ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-amber" role="status">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-amber px-4 py-2 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save rating"}
      </button>
    </form>
  );
}
