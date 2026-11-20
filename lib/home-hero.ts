import type { HeroSlide } from "@/components/hero-carousel";
import { shuffleHeroPicks, todayKey } from "@/lib/daily-hero";
import {
  getHomeTmdbBundle,
  homeTmdbBundleHasContent,
} from "@/lib/home-tmdb-bundle";
import { tmdbImageUrl } from "@/lib/tmdb-image-loader";
import { backdropUrl, posterUrl, type TmdbMovie } from "@/lib/tmdb";

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

function buildSlidesFromPools(
  latestMovies: TmdbMovie[],
  topRated: TmdbMovie[],
  trending: TmdbMovie[],
  day: string,
): HeroSlide[] {
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

  return picks.map(({ movie, categoryLabel }) => ({
    id: movie.id,
    title: movie.title,
    categoryLabel,
    overview: movie.overview,
    tagline: null,
    backdropUrl: backdropUrl(movie.backdrop_path),
    posterUrl: posterUrl(movie.poster_path, "w500"),
    meta: movie.release_date?.slice(0, 4) ?? "",
    rating: movie.vote_average,
    trailerKey: null,
  }));
}

/**
 * Hero slides from the shared home TMDB bundle (no trailer fan-out).
 */
export async function getHomeHeroPayload(): Promise<HomeHeroPayload> {
  const day = todayKey();
  try {
    const bundle = await getHomeTmdbBundle();
    if (!homeTmdbBundleHasContent(bundle)) return EMPTY_HERO;

    const slides = buildSlidesFromPools(
      bundle.latest,
      bundle.topRated.results,
      bundle.trending.results,
      day,
    );
    if (slides.length === 0) return EMPTY_HERO;

    const firstBackdrop = slides[0]?.backdropUrl;
    return {
      slides,
      preload780: firstBackdrop ? tmdbImageUrl(firstBackdrop, 780) : null,
      preload1280: firstBackdrop ? tmdbImageUrl(firstBackdrop, 1280) : null,
    };
  } catch (err) {
    console.warn("Home hero payload failed:", err);
    return EMPTY_HERO;
  }
}
