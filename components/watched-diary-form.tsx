"use client";

import { useActionState, useEffect } from "react";
import {
  logRewatch,
  updateWatchedDiary,
  type WatchedDateState,
} from "@/app/actions/favorites";
import { MEDIA_MOVIE, type MediaListType } from "@/lib/lists";
import { cn } from "@/lib/utils";

type WatchedDiaryFormProps = {
  movieId: number;
  initialWatchedAt: Date | string | null;
  initialNote: string | null;
  rewatchCount?: number;
  mediaType?: MediaListType;
  className?: string;
  onSuccess?: () => void;
  /** Compact modal layout vs detail shelf. */
  compact?: boolean;
};

const diaryInitial: WatchedDateState = {};
const rewatchInitial: WatchedDateState = {};

function toDateInputValue(value: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Diary log for a watched title — date, short note, and rewatch.
 */
export function WatchedDiaryForm({
  movieId,
  initialWatchedAt,
  initialNote,
  rewatchCount = 0,
  mediaType = MEDIA_MOVIE,
  className,
  onSuccess,
  compact = false,
}: WatchedDiaryFormProps) {
  const [diaryState, diaryAction, diaryPending] = useActionState(
    updateWatchedDiary,
    diaryInitial,
  );
  const [rewatchState, rewatchAction, rewatchPending] = useActionState(
    logRewatch,
    rewatchInitial,
  );

  useEffect(() => {
    if (diaryState.success || rewatchState.success) onSuccess?.();
  }, [diaryState.success, rewatchState.success, onSuccess]);

  const today = toDateInputValue(new Date());
  const totalPlays = rewatchCount + 1;

  return (
    <div className={cn("flex w-full flex-col gap-5", className)}>
      <form action={diaryAction} className="flex flex-col gap-4">
        <input type="hidden" name="movieId" value={movieId} />
        <input type="hidden" name="mediaType" value={mediaType} />

        <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.18em] text-cream/45 uppercase">
          Watched on
          <input
            type="date"
            name="watchedAt"
            required
            defaultValue={toDateInputValue(initialWatchedAt) || today}
            max={today}
            className="rounded-xl border border-cream/12 bg-black/35 px-4 py-3 text-sm font-normal normal-case tracking-normal text-cream outline-none transition-[border-color,box-shadow] focus:border-amber/45 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--amber)_12%,transparent)]"
          />
        </label>

        <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.18em] text-cream/45 uppercase">
          Diary note
          <textarea
            name="note"
            rows={compact ? 3 : 4}
            maxLength={280}
            defaultValue={initialNote ?? ""}
            placeholder="A line about this watch…"
            className="resize-y rounded-2xl border border-cream/12 bg-black/30 px-4 py-3 text-sm font-normal normal-case tracking-normal text-cream outline-none placeholder:text-cream/30 transition-[border-color,box-shadow,background-color] focus:border-amber/45 focus:bg-black/45 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--amber)_12%,transparent)]"
          />
        </label>

        {diaryState.error ? (
          <p className="text-sm text-red-400" role="alert">
            {diaryState.error}
          </p>
        ) : null}
        {diaryState.success ? (
          <p className="text-sm text-amber" role="status">
            Saved.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={diaryPending}
          className="cta-shine relative inline-flex w-fit overflow-hidden rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-[color:var(--on-amber)] transition-colors hover:bg-(--amber-dim) hover:text-cream disabled:opacity-60"
        >
          {diaryPending ? "Saving…" : "Save diary"}
        </button>
      </form>

      <div className="border-t border-cream/8 pt-4">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-cream/45 uppercase">
          Plays
        </p>
        <p className="mt-2 text-sm text-cream/65">
          <span className="font-medium text-cream/85">{totalPlays}</span>
          {totalPlays === 1 ? " watch" : " watches"}
          {rewatchCount > 0 ? (
            <span className="text-cream/40">
              {" "}
              · {rewatchCount} rewatch{rewatchCount === 1 ? "" : "es"}
            </span>
          ) : null}
        </p>

        <form action={rewatchAction} className="mt-3">
          <input type="hidden" name="movieId" value={movieId} />
          <input type="hidden" name="mediaType" value={mediaType} />
          <input type="hidden" name="watchedAt" value={today} />
          <button
            type="submit"
            disabled={rewatchPending}
            className="rounded-full border border-cream/15 px-4 py-2 text-sm text-cream/70 transition-colors hover:border-amber/40 hover:text-amber disabled:opacity-60"
          >
            {rewatchPending ? "Logging…" : "Log rewatch"}
          </button>
        </form>

        {rewatchState.error ? (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {rewatchState.error}
          </p>
        ) : null}
        {rewatchState.success ? (
          <p className="mt-2 text-sm text-amber" role="status">
            Rewatch logged.
          </p>
        ) : null}
      </div>
    </div>
  );
}
