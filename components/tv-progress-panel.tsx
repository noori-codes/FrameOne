"use client";

import { Check, ChevronDown } from "lucide-react";
import { useActionState, useMemo, useState, useTransition } from "react";
import {
  clearTvSeasonProgress,
  markTvSeasonWatched,
  toggleTvEpisode,
  type TvProgressState,
} from "@/app/actions/tv-progress";
import type { TmdbTvEpisode, TmdbTvSeasonSummary } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

export type TvProgressSeasonData = TmdbTvSeasonSummary & {
  episodes: TmdbTvEpisode[];
};

type WatchedKey = `${number}:${number}`;

function keyOf(season: number, episode: number): WatchedKey {
  return `${season}:${episode}`;
}

type TvProgressPanelProps = {
  showId: number;
  showName: string;
  seasons: TvProgressSeasonData[];
  /** Watched episode keys from the server: "season:episode". */
  watchedKeys: string[];
};

const idle: TvProgressState = {};

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className="h-1.5 overflow-hidden rounded-full bg-cream/10"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-full rounded-full bg-amber transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SeasonBlock({
  showId,
  season,
  watched,
}: {
  showId: number;
  season: TvProgressSeasonData;
  watched: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [, toggleAction] = useActionState(toggleTvEpisode, idle);
  const [, markAction, markPending] = useActionState(markTvSeasonWatched, idle);
  const [, clearAction, clearPending] = useActionState(
    clearTvSeasonProgress,
    idle,
  );

  const total = season.episodes.length || season.episode_count || 0;
  const done = season.episodes.length
    ? season.episodes.filter((ep) =>
        watched.has(keyOf(season.season_number, ep.episode_number)),
      ).length
    : Array.from(watched).filter((k) =>
        k.startsWith(`${season.season_number}:`),
      ).length;
  const complete = total > 0 && done >= total;

  return (
    <li className="rounded-2xl border border-cream/10 bg-cream/[0.02]">
      <div className="flex flex-col gap-3 px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="min-w-0 flex-1 text-left"
            aria-expanded={open}
          >
            <div className="flex items-center gap-2">
              <p className="font-medium text-cream/90">
                {season.name || `Season ${season.season_number}`}
              </p>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-cream/40 transition-transform",
                  open && "rotate-180",
                )}
                aria-hidden
              />
            </div>
            <p className="mt-1 text-xs text-cream/45">
              {done}/{total || "—"} episodes
              {complete ? " · complete" : ""}
            </p>
          </button>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {complete ? (
              <form action={clearAction}>
                <input type="hidden" name="showId" value={showId} />
                <input
                  type="hidden"
                  name="seasonNumber"
                  value={season.season_number}
                />
                <button
                  type="submit"
                  disabled={clearPending}
                  className="rounded-full border border-cream/12 px-3 py-1.5 text-xs text-cream/55 transition-colors hover:border-cream/30 hover:text-cream/80 disabled:opacity-60"
                >
                  {clearPending ? "Clearing…" : "Clear"}
                </button>
              </form>
            ) : (
              <form action={markAction}>
                <input type="hidden" name="showId" value={showId} />
                <input
                  type="hidden"
                  name="seasonNumber"
                  value={season.season_number}
                />
                <button
                  type="submit"
                  disabled={markPending || total === 0}
                  className="rounded-full border border-amber/35 bg-amber/10 px-3 py-1.5 text-xs font-medium text-amber transition-colors hover:border-amber/55 hover:bg-amber/15 disabled:opacity-60"
                >
                  {markPending ? "Saving…" : "Mark season"}
                </button>
              </form>
            )}
          </div>
        </div>

        <ProgressBar value={done} max={total || 1} />
      </div>

      {open ? (
        <ul className="border-t border-cream/8 px-2 py-2 sm:px-3">
          {season.episodes.length === 0 ? (
            <li className="px-3 py-3 text-sm text-cream/45">
              No episode list available.
            </li>
          ) : (
            season.episodes.map((episode) => {
              const isWatched = watched.has(
                keyOf(season.season_number, episode.episode_number),
              );
              return (
                <li key={episode.id}>
                  <form
                    action={(fd) => {
                      startTransition(() => {
                        toggleAction(fd);
                      });
                    }}
                  >
                    <input type="hidden" name="showId" value={showId} />
                    <input
                      type="hidden"
                      name="seasonNumber"
                      value={season.season_number}
                    />
                    <input
                      type="hidden"
                      name="episodeNumber"
                      value={episode.episode_number}
                    />
                    <button
                      type="submit"
                      disabled={pending}
                      aria-pressed={isWatched}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        isWatched
                          ? "bg-amber/8 hover:bg-amber/12"
                          : "hover:bg-cream/4",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                          isWatched
                            ? "border-amber bg-amber text-[color:var(--on-amber)]"
                            : "border-cream/20 text-transparent",
                        )}
                      >
                        <Check className="size-3" strokeWidth={3} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-cream/85">
                          <span className="text-cream/40">
                            E{String(episode.episode_number).padStart(2, "0")}
                          </span>{" "}
                          {episode.name || `Episode ${episode.episode_number}`}
                        </span>
                        {episode.air_date ? (
                          <span className="mt-0.5 block text-[11px] text-cream/35">
                            {episode.air_date}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </form>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * Season / episode checklist for a signed-in viewer.
 */
export function TvProgressPanel({
  showId,
  showName,
  seasons,
  watchedKeys,
}: TvProgressPanelProps) {
  const watched = useMemo(
    () => new Set(watchedKeys),
    [watchedKeys],
  );

  // Specials (season 0) last in the list; Up next prefers regular seasons.
  const trackable = seasons
    .filter(
      (season) =>
        season.episode_count > 0 || season.episodes.length > 0,
    )
    .slice()
    .sort((a, b) => {
      const aSpecial = a.season_number === 0 ? 1 : 0;
      const bSpecial = b.season_number === 0 ? 1 : 0;
      if (aSpecial !== bSpecial) return aSpecial - bSpecial;
      return a.season_number - b.season_number;
    });

  const totalEps = trackable.reduce(
    (sum, season) =>
      sum + (season.episodes.length || season.episode_count || 0),
    0,
  );
  const watchedCount = Math.min(watchedKeys.length, totalEps || watchedKeys.length);
  const upNext = findUpNext(trackable, watched);

  if (trackable.length === 0) return null;

  return (
    <section
      aria-labelledby="tv-progress-heading"
      className="border-t border-cream/10 pt-8 sm:pt-10"
    >
      <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase sm:text-xs">
        Continue
      </p>
      <h2
        id="tv-progress-heading"
        className="mt-2 font-display text-4xl text-cream uppercase sm:text-5xl"
      >
        Progress
      </h2>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-cream/60">
            <span className="font-medium text-cream/85">{watchedCount}</span>
            {totalEps > 0 ? (
              <>
                {" "}
                of {totalEps} episodes on{" "}
                <span className="text-cream/80">{showName}</span>
              </>
            ) : (
              " episodes logged"
            )}
          </p>
        </div>
        {totalEps > 0 ? (
          <p className="text-xs tracking-wide text-cream/40 uppercase">
            {Math.min(100, Math.round((watchedCount / totalEps) * 100))}%
          </p>
        ) : null}
      </div>

      {totalEps > 0 ? (
        <div className="mt-3 max-w-xl">
          <ProgressBar value={watchedCount} max={totalEps} />
        </div>
      ) : null}

      {upNext ? (
        <div className="mt-6 max-w-xl overflow-hidden rounded-2xl border border-amber/25 bg-linear-to-br from-amber/12 via-cream/[0.03] to-transparent p-4 sm:p-5">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-amber uppercase">
            Up next
          </p>
          <p className="mt-2 font-display text-2xl tracking-wide text-cream uppercase sm:text-3xl">
            S{upNext.seasonNumber}E
            {String(upNext.episodeNumber).padStart(2, "0")}
          </p>
          {upNext.name ? (
            <p className="mt-1 text-sm text-cream/70">{upNext.name}</p>
          ) : null}
          <p className="mt-3 text-xs text-cream/40">
            Expand the season below to mark it watched.
          </p>
        </div>
      ) : watchedCount > 0 && totalEps > 0 && watchedCount >= totalEps ? (
        <p className="mt-5 text-sm text-cream/45">You’re caught up.</p>
      ) : null}

      <ul className="mt-6 flex max-w-2xl flex-col gap-3">
        {trackable.map((season) => (
          <SeasonBlock
            key={season.id}
            showId={showId}
            season={season}
            watched={watched}
          />
        ))}
      </ul>
    </section>
  );
}

function findUpNext(
  seasons: TvProgressSeasonData[],
  watched: Set<string>,
) {
  const regular = seasons.filter((season) => season.season_number > 0);
  const specials = seasons.filter((season) => season.season_number === 0);
  // Prefer S1+; only fall back to Specials once every regular ep is logged.
  for (const season of [...regular, ...specials]) {
    for (const episode of season.episodes) {
      if (!watched.has(keyOf(season.season_number, episode.episode_number))) {
        return {
          seasonNumber: season.season_number,
          episodeNumber: episode.episode_number,
          name: episode.name,
        };
      }
    }
  }
  return null;
}
