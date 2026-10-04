import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";
import { MovieRow } from "@/components/movie-row";
import { pickDailyHeroMovies, todayKey } from "@/lib/daily-hero";
import {
  backdropUrl,
  getMovie,
  getMovieTrailerKey,
  getMoviesByGenre,
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
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
  { id: 27, slug: "horror", title: "Horror" },
  { id: 878, slug: "scifi", title: "Sci-Fi" },
  { id: 10749, slug: "romance", title: "Romance" },
  { id: 16, slug: "animation", title: "Animation" },
  { id: 53, slug: "thriller", title: "Thriller" },
] as const;

/**
 * Home: daily hero carousel + discovery rows + genre strips.
 */
export default async function Home() {
  const [popular, trending, topRated, ...genrePages] = await Promise.all([
    getPopularMovies(),
    getTrendingMovies("day"),
    getTopRatedMovies(),
    ...HOME_GENRE_ROWS.map((g) => getMoviesByGenre(g.id)),
  ]);

  const heroPicks = pickDailyHeroMovies([trending, popular], 5, todayKey());
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

      <div className="relative z-10 flex w-full flex-col gap-20 border-t border-cream/8 pt-16 pb-24 sm:gap-24 sm:pt-20 sm:pb-28">
        <MovieRow id="trending" title="Trending now" movies={trending} />
        <MovieRow id="popular" title="Popular now" movies={popular} />
        <MovieRow id="top-rated" title="Top rated" movies={topRated} />

        {HOME_GENRE_ROWS.map((genre, i) => (
          <MovieRow
            key={genre.id}
            id={genre.slug}
            title={genre.title}
            movies={genrePages[i]?.results ?? []}
            href={`/genres/${genre.id}`}
          />
        ))}
      </div>
    </main>
  );
}
