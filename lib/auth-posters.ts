import {
  backdropUrl,
  getTrendingMovies,
  type TmdbMovie,
} from "@/lib/tmdb";
import { shuffleHeroPicks } from "@/lib/daily-hero";

export type AuthScene = {
  id: number;
  title: string;
  /** High-quality TMDB backdrop (w1280). */
  src: string;
};

/** Enough variety to rotate, still light on bandwidth. */
const SCENE_COUNT = 8;

function collectScenes(movies: TmdbMovie[]): AuthScene[] {
  const seen = new Set<number>();
  const out: AuthScene[] = [];

  for (const movie of movies) {
    if (!movie.backdrop_path || seen.has(movie.id)) continue;
    const src = backdropUrl(movie.backdrop_path, "w1280");
    if (!src) continue;
    seen.add(movie.id);
    out.push({ id: movie.id, title: movie.title, src });
    if (out.length >= SCENE_COUNT) break;
  }

  return out;
}

/**
 * Daily-rotated trending backdrops for the auth brand panel.
 */
export async function getAuthScenes(): Promise<AuthScene[]> {
  try {
    const trending = await getTrendingMovies("day");
    const shuffled = shuffleHeroPicks(trending);
    return collectScenes(shuffled);
  } catch (err) {
    console.error("Failed to load auth scenes:", err);
    return [];
  }
}
