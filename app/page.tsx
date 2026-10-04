import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";
import { MovieRow } from "@/components/movie-row";
import { SiteFooter } from "@/components/site-footer";
import { HERO_COUNT, pickDailyHeroMovies, todayKey } from "@/lib/daily-hero";
import {
  backdropUrl,
  getMovie,
  getMovieTrailerKey,
  getMoviesByGenre,
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
  mapPool,
  type TmdbMovie,
} from "@/lib/tmdb";

/** Refresh at least hourly so a new UTC day picks a new hero set. */
export const revalidate = 3600;

/**
 * Curated TMDB genre rows for the home page.
 * IDs come from TMDB’s genre list (same as /genres).
 */
const HOME_GENRE_ROWS = [
  { id: 35, slug: "comedy", title: "Comedy" },
  { id: 10751, slug: "family", title: "Family" },
  { id: 28, slug: "action", title: "Action" },
  { id: 12, slug: "adventure", title: "Adventure" },
  { id: 27, slug: "horror", title: "Horror" },
  { id: 878, slug: "scifi", title: "Sci-Fi" },
  { id: 14, slug: "fantasy", title: "Fantasy" },
  { id: 10749, slug: "romance", title: "Romance" },
  { id: 16, slug: "animation", title: "Animation" },
  { id: 53, slug: "thriller", title: "Thriller" },
  { id: 18, slug: "drama", title: "Drama" },
  { id: 80, slug: "crime", title: "Crime" },
  { id: 9648, slug: "mystery", title: "Mystery" },
  { id: 10752, slug: "war", title: "War" },
] as const;

/**
 * When a title has several genres, the earliest id here “owns” it on home.
 * Specific genres (Animation, Horror, …) beat broad ones (Family, Drama).
 */
const GENRE_CLAIM_PRIORITY = [
  16, // Animation
  27, // Horror
  10752, // War
  878, // Sci-Fi
  9648, // Mystery
  80, // Crime
  53, // Thriller
  10749, // Romance
  14, // Fantasy
  12, // Adventure
  28, // Action
  35, // Comedy
  18, // Drama
  10751, // Family — often overlaps Animation / Comedy
] as const;

const GENRE_PAGES = 4; // ~80 candidates each — enough for 50 after dedupe
const GENRE_FETCH_CONCURRENCY = 8; // don’t open 100+ sockets to TMDB at once
const GENRE_ROW_SIZE = 50;
const DISCOVERY_ROW_SIZE = 28;

/**
 * Home: daily hero carousel + discovery rows + genre strips.
 */
export default async function Home() {
  const [popularP1, popularP2, trendingP1, trendingP2, topRatedP1, topRatedP2] =
    await Promise.all([
      getPopularMovies(1),
      getPopularMovies(2),
      getTrendingMovies("day", 1),
      getTrendingMovies("day", 2),
      getTopRatedMovies(1),
      getTopRatedMovies(2),
    ]);

  // Cap concurrency — a full Promise.all of every genre page was timing out
  const genreJobs = HOME_GENRE_ROWS.flatMap((g) =>
    Array.from({ length: GENRE_PAGES }, (_, i) => ({
      genreId: g.id,
      page: i + 1,
    })),
  );
  const genrePagePairs = await mapPool(
    genreJobs,
    GENRE_FETCH_CONCURRENCY,
    ({ genreId, page }) => getMoviesByGenre(genreId, page),
  );

  function mergePages(...pages: TmdbMovie[][]): TmdbMovie[] {
    const seen = new Set<number>();
    const out: TmdbMovie[] = [];
    for (const page of pages) {
      for (const movie of page) {
        if (seen.has(movie.id)) continue;
        seen.add(movie.id);
        out.push(movie);
      }
    }
    return out;
  }

  /** Claim movies for a row; skip ids already taken in `used`. */
  function takeUnique(
    movies: TmdbMovie[],
    used: Set<number>,
    limit?: number,
  ): TmdbMovie[] {
    const out: TmdbMovie[] = [];
    for (const movie of movies) {
      if (used.has(movie.id)) continue;
      used.add(movie.id);
      out.push(movie);
      if (limit != null && out.length >= limit) break;
    }
    return out;
  }

  // Discovery rows dedupe only among themselves (not against genres)
  const usedInDiscovery = new Set<number>();
  const trending = takeUnique(
    mergePages(trendingP1, trendingP2),
    usedInDiscovery,
    DISCOVERY_ROW_SIZE,
  );
  const popular = takeUnique(
    mergePages(popularP1, popularP2),
    usedInDiscovery,
    DISCOVERY_ROW_SIZE,
  );
  const topRated = takeUnique(
    mergePages(topRatedP1, topRatedP2),
    usedInDiscovery,
    DISCOVERY_ROW_SIZE,
  );

  // Per-genre discover pools, then claim in priority order (Animation before Family)
  const genrePools = new Map<number, TmdbMovie[]>();
  HOME_GENRE_ROWS.forEach((genre, i) => {
    const start = i * GENRE_PAGES;
    const pages = genrePagePairs
      .slice(start, start + GENRE_PAGES)
      .map((p) => p.results);
    genrePools.set(genre.id, mergePages(...pages));
  });

  const usedInGenres = new Set<number>();
  const genreBuckets = new Map<number, TmdbMovie[]>();
  for (const genreId of GENRE_CLAIM_PRIORITY) {
    genreBuckets.set(
      genreId,
      takeUnique(
        genrePools.get(genreId) ?? [],
        usedInGenres,
        GENRE_ROW_SIZE,
      ),
    );
  }

  const genreRows = HOME_GENRE_ROWS.map((genre) => ({
    ...genre,
    movies: genreBuckets.get(genre.id) ?? [],
  }));

  const heroPicks = pickDailyHeroMovies(
    [trendingP1, popularP1],
    HERO_COUNT,
    todayKey(),
  );
  const heroDetails = (
    await Promise.all(heroPicks.map((m) => getMovie(m.id)))
  ).filter((m): m is NonNullable<typeof m> => m != null);

  const trailerKeys = await Promise.all(
    heroDetails.map((m) => getMovieTrailerKey(m.id)),
  );

  const slides: HeroSlide[] = heroDetails.map((movie, i) => {
    const year = movie.release_date?.slice(0, 4);
    const runtime =
      movie.runtime != null
        ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
        : null;
    const genres = movie.genres?.map((g) => g.name).join(" / ");
    const meta = [
      year,
      genres,
      runtime,
      `★ ${movie.vote_average.toFixed(1)}`,
    ]
      .filter(Boolean)
      .join(" · ");

    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      tagline: movie.tagline,
      backdropUrl: backdropUrl(movie.backdrop_path),
      meta,
      trailerKey: trailerKeys[i] ?? null,
    };
  });

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-x-hidden">
      <HeroCarousel slides={slides} />

      <div className="relative z-10 flex w-full flex-col gap-20 border-t border-cream/8 pt-16 pb-16 sm:gap-24 sm:pt-20 sm:pb-20">
        <MovieRow
          id="trending"
          title="Trending now"
          movies={trending}
          href="/browse/trending"
        />
        <MovieRow
          id="popular"
          title="Popular now"
          movies={popular}
          href="/browse/popular"
        />
        <MovieRow
          id="top-rated"
          title="Top rated"
          movies={topRated}
          href="/browse/top-rated"
        />

        {genreRows.map((genre) => (
          <MovieRow
            key={genre.id}
            id={genre.slug}
            title={genre.title}
            movies={genre.movies}
            href={`/genres/${genre.id}`}
          />
        ))}
      </div>

      <SiteFooter />
    </main>
  );
}
