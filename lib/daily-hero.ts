import type { TmdbMovie } from "@/lib/tmdb";

/** How many hero slides to rotate through each day. */
export const HERO_COUNT = 5;

/** UTC calendar day — same picks all day, new set tomorrow. */
export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic shuffle so the same day always yields the same order. */
function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pick a few backdrop-ready movies for today's hero.
 * Mixes trending + popular, dedupes, shuffles by date — not a fixed list.
 */
export function pickDailyHeroMovies(
  pools: TmdbMovie[][],
  count = HERO_COUNT,
  day = todayKey(),
): TmdbMovie[] {
  const seen = new Set<number>();
  const withBackdrop: TmdbMovie[] = [];

  for (const pool of pools) {
    for (const movie of pool) {
      if (!movie.backdrop_path || seen.has(movie.id)) continue;
      seen.add(movie.id);
      withBackdrop.push(movie);
    }
  }

  if (withBackdrop.length === 0) return [];

  return seededShuffle(withBackdrop, hashSeed(`frameone-hero:${day}`)).slice(
    0,
    Math.min(count, withBackdrop.length),
  );
}
