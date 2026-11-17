import { unstable_cache } from "next/cache";
import type { HeroSlide } from "@/components/hero-carousel";
import { shuffleHeroPicks, todayKey } from "@/lib/daily-hero";
import { tmdbImageUrl } from "@/lib/tmdb-image-loader";
import {
  backdropUrl,
  getLatestMovies,
  getTopRatedMoviesPage,
  getTrendingMoviesPage,
  posterUrl,
  type TmdbMovie,
} from "@/lib/tmdb";

const HERO_GROUP_SIZE = 3;

export type HomeHeroPayload = {
  slides: HeroSlide[];
  preload780: string | null;
  preload1280: string | null;
};

const EMPTY_HERO: HomeHeroPayload = {
  slides: [],
  preload780: null,
  preload1280: null,
};

async function buildHomeHeroPayload(day: string): Promise<HomeHeroPayload> {
  const [latestResult, topRatedResult, trendingResult] = await Promise.allSettled(
    [
      getLatestMovies(),
      getTopRatedMoviesPage(1).then((page) => page.results),
      getTrendingMoviesPage("day", 1).then((page) => page.results),
    ],
  );

  const latestMovies =
    latestResult.status === "fulfilled" ? latestResult.value : [];
  const topRated =
    topRatedResult.status === "fulfilled" ? topRatedResult.value : [];
  const trending =
    trendingResult.status === "fulfilled" ? trendingResult.value : [];

  for (const result of [latestResult, topRatedResult, trendingResult]) {
    if (result.status === "rejected") {
      console.warn("Home hero pool failed:", result.reason);
    }
  }

  const used = new Set<number>();
  function pickGroup(movies: TmdbMovie[], categoryLabel: string) {
    const picks: { movie: TmdbMovie; categoryLabel: string }[] = [];

    for (const movie of movies) {
      if (
        used.has(movie.id) ||
        !movie.backdrop_path ||
        movie.genre_ids?.includes(16)
      ) {
        continue;
      }
      used.add(movie.id);
      picks.push({ movie, categoryLabel });
      if (picks.length === HERO_GROUP_SIZE) break;
    }

    return picks;
  }

  const picks = shuffleHeroPicks(
    [
      ...pickGroup(latestMovies, "Latest releases"),
      ...pickGroup(topRated, "Top rated"),
      ...pickGroup(trending, "Trending now"),
    ],
    day,
  );

  const slides: HeroSlide[] = picks.map(({ movie, categoryLabel }) => ({
    id: movie.id,
    title: movie.title,
    categoryLabel,
    overview: movie.overview,
    tagline: null,
    backdropUrl: backdropUrl(movie.backdrop_path),
    posterUrl: posterUrl(movie.poster_path, "w500"),
    meta: movie.release_date?.slice(0, 4) ?? "",
    rating: movie.vote_average,
    // On-demand via /api/movies/[id]/trailer — keeps hero off the N+1 path.
    trailerKey: null,
  }));

  const firstBackdrop = slides[0]?.backdropUrl;
  return {
    slides,
    preload780: firstBackdrop ? tmdbImageUrl(firstBackdrop, 780) : null,
    preload1280: firstBackdrop ? tmdbImageUrl(firstBackdrop, 1280) : null,
  };
}

/**
 * Cached hero slides for the UTC day. Trailers load on demand via TrailerButton.
 * Never caches an empty payload — a TMDB outage would otherwise lock the
 * “Movies, lit for the night” fallback for the full revalidate window.
 */
export async function getHomeHeroPayload(): Promise<HomeHeroPayload> {
  const day = todayKey();

  try {
    return await unstable_cache(
      async () => {
        const payload = await buildHomeHeroPayload(day);
        if (payload.slides.length === 0) {
          throw new Error("HOME_HERO_EMPTY");
        }
        return payload;
      },
      ["home-hero-payload", day],
      { revalidate: 3600 },
    )();
  } catch (err) {
    if (err instanceof Error && err.message === "HOME_HERO_EMPTY") {
      return EMPTY_HERO;
    }
    // Cache miss / transient failure — try once uncached so recovery isn’t blocked.
    try {
      return await buildHomeHeroPayload(day);
    } catch (liveErr) {
      console.warn("Home hero live fetch failed:", liveErr);
      return EMPTY_HERO;
    }
  }
}
