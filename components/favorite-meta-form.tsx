"use client";

import { Star } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import {
  updateFavoriteMeta,
  type FavoriteMetaState,
} from "@/app/actions/favorites";
import { MEDIA_MOVIE, type MediaListType } from "@/lib/lists";
import { cn } from "@/lib/utils";

type FavoriteMetaFormProps = {
  movieId: number;
  initialRating: number | null;
  initialNote: string | null;
  className?: string;
  onSuccess?: () => void;
  mediaType?: MediaListType;
};

const initial: FavoriteMetaState = {};

/**
 * Interactive 1–10 score + optional note for a saved favorite.
 */
export function FavoriteMetaForm({
  movieId,
  initialRating,
  initialNote,
  className,
  onSuccess,
  mediaType = MEDIA_MOVIE,
}: FavoriteMetaFormProps) {
  const [state, action, pending] = useActionState(updateFavoriteMeta, initial);
  const [rating, setRating] = useState<number | "">(initialRating ?? "");
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (state.success) onSuccess?.();
  }, [state.success, onSuccess]);

  const preview = hover ?? (rating === "" ? 0 : rating);

  return (
    <form
      action={action}
      className={cn("flex w-full flex-col gap-5", className)}
    >
      <input type="hidden" name="movieId" value={movieId} />
      <input type="hidden" name="mediaType" value={mediaType} />
      <input type="hidden" name="rating" value={rating === "" ? "" : rating} />

      <fieldset>
        <legend className="text-[10px] font-semibold tracking-[0.18em] text-cream/45 uppercase">
          Your rating
        </legend>
        <div
          className="mt-3 flex flex-wrap items-center gap-1"
          onMouseLeave={() => setHover(null)}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const active = preview >= n;
            return (
              <button
                key={n}
                type="button"
                aria-label={`Rate ${n} out of 10`}
                aria-pressed={rating === n}
                onMouseEnter={() => setHover(n)}
                onFocus={() => setHover(n)}
                onBlur={() => setHover(null)}
                onClick={() => setRating((prev) => (prev === n ? "" : n))}
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg transition-[color,background-color,transform] duration-200",
                  active
                    ? "bg-amber/15 text-amber"
                    : "text-cream/25 hover:bg-cream/5 hover:text-cream/55",
                )}
              >
                <Star
                  className={cn(
                    "size-5 transition-transform duration-200",
                    active && "fill-amber scale-105",
                  )}
                  strokeWidth={1.5}
                />
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-cream/45">
          {preview > 0 ? (
            <>
              <span className="font-medium text-amber">{preview}</span>
              <span className="text-cream/30"> / 10</span>
            </>
          ) : (
            "Tap a star to rate — tap again to clear"
          )}
        </p>
      </fieldset>

      <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.18em] text-cream/45 uppercase">
        Note
        <textarea
          name="note"
          rows={4}
          maxLength={280}
          defaultValue={initialNote ?? ""}
          placeholder="Why this one stuck with you…"
          className="resize-y rounded-2xl border border-cream/12 bg-black/30 px-4 py-3 text-sm font-normal normal-case tracking-normal text-cream outline-none placeholder:text-cream/30 transition-[border-color,box-shadow,background-color] focus:border-amber/45 focus:bg-black/45 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--amber)_12%,transparent)]"
        />
      </label>

      {state.error ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="text-sm text-amber" role="status">
          Saved.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="cta-shine relative inline-flex overflow-hidden rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-[color:var(--on-amber)] transition-[background-color,box-shadow] hover:bg-(--amber-dim) hover:text-cream disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {rating !== "" ? (
          <button
            type="button"
            onClick={() => setRating("")}
            className="text-sm text-cream/40 transition-colors hover:text-cream/70"
          >
            Clear rating
          </button>
        ) : null}
      </div>
    </form>
  );
}
