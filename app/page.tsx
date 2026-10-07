import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";
import { MovieRow } from "@/components/movie-row";
import { SiteFooter } from "@/components/site-footer";
import { shuffleHeroPicks } from "@/lib/daily-hero";
import {
  backdropUrl,
  getMovie,
  getMovieTrailerKeyFromVideos,
  getLatestMovies,
  getMoviesByGenre,
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
  mapPool,
  posterUrl,
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

const GENRE_FETCH_CONCURRENCY = 8; // don’t open 100+ sockets to TMDB at once
const GENRE_HOME_ROW_SIZE = 12;
const DISCOVERY_ROW_SIZE = 28;
const HERO_GROUP_SIZE = 3;

/**
 * Home: daily hero carousel + discovery rows + genre strips.
 */
export default async function Home() {
  const [
    latestMovies,
    popularP1,
    popularP2,
    trendingP1,
    trendingP2,
    topRatedP1,
    topRatedP2,
  ] = await Promise.all([
    getLatestMovies(),
    getPopularMovies(1),
    getPopularMovies(2),
    getTrendingMovies("day", 1),
    getTrendingMovies("day", 2),
    getTopRatedMovies(1),
    getTopRatedMovies(2),
  ]);

  // Cap concurrency — a full Promise.all of every genre page was timing out
  const genrePagePairs = await mapPool(
    HOME_GENRE_ROWS,
    GENRE_FETCH_CONCURRENCY,
    ({ id }) => getMoviesByGenre(id, 1),
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

  // Keep home rows small and independent; full results load on each genre page.
  const genreRows = HOME_GENRE_ROWS.map((genre, i) => ({
    ...genre,
    movies: genrePagePairs[i]!.results.slice(0, GENRE_HOME_ROW_SIZE),
  }));

  const usedInHero = new Set<number>();
  function pickHeroGroup(movies: TmdbMovie[], categoryLabel: string) {
    const picks: { movie: TmdbMovie; categoryLabel: string }[] = [];

    for (const movie of movies) {
      if (
        usedInHero.has(movie.id) ||
        !movie.backdrop_path ||
        movie.genre_ids?.includes(16)
      ) {
        continue;
      }
      usedInHero.add(movie.id);
      picks.push({ movie, categoryLabel });
      if (picks.length === HERO_GROUP_SIZE) break;
    }

    return picks;
  }

  const heroPicks = shuffleHeroPicks([
    ...pickHeroGroup(latestMovies, "Latest releases"),
    ...pickHeroGroup(mergePages(topRatedP1, topRatedP2), "Top rated"),
    ...pickHeroGroup(trending, "Trending now"),
  ]);
  const heroCategoryById = new Map(
    heroPicks.map(({ movie, categoryLabel }) => [movie.id, categoryLabel]),
  );
  const heroDetails = await Promise.all(
    heroPicks.map(async ({ movie }) => {
      try {
        return await getMovie(movie.id, { appendToResponse: ["videos"] });
      } catch (error) {
        console.error(
          `Failed to load featured movie details for TMDB movie ${movie.id}:`,
          error,
        );
        return null;
      }
    }),
  );

  const slides: HeroSlide[] = heroPicks.map(({ movie }, i) => {
    const details = heroDetails[i];
    const year = movie.release_date?.slice(0, 4);
    const runtime =
      details?.runtime != null
        ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
        : null;
    const genres = details?.genres.map((g) => g.name).join(" / ");
    const meta = [year, genres, runtime].filter(Boolean).join(" · ");

    return {
      id: movie.id,
      title: movie.title,
      categoryLabel: heroCategoryById.get(movie.id) ?? "Featured film",
      overview: movie.overview,
      tagline: details?.tagline ?? null,
      backdropUrl: backdropUrl(movie.backdrop_path),
      posterUrl: posterUrl(movie.poster_path, "w500"),
      meta,
      rating: movie.vote_average,
      trailerKey: getMovieTrailerKeyFromVideos(details?.videos?.results),
    };
  });

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-x-hidden">
      <HeroCarousel slides={slides} />

      <div className="relative z-10 flex w-full flex-col gap-14 border-t border-cream/8 pt-12 pb-12 sm:gap-24 sm:pt-20 sm:pb-20">
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
