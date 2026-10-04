import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MovieCard } from "@/components/movie-card";
import { PaginationNav, parsePageParam } from "@/components/pagination-nav";
import { getMovieGenres, getMoviesByGenre } from "@/lib/tmdb";

type GenrePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
}: GenrePageProps): Promise<Metadata> {
  const { id } = await params;
  const genres = await getMovieGenres();
  const genre = genres.find((g) => String(g.id) === id);
  return { title: genre?.name ?? "Genre" };
}

export default async function GenrePage({
  params,
  searchParams,
}: GenrePageProps) {
  const { id } = await params;
  const { page: pageRaw } = await searchParams;
  const genreId = Number(id);
  const page = parsePageParam(pageRaw);

  if (!Number.isFinite(genreId) || genreId <= 0) notFound();

  const [genres, moviesPage] = await Promise.all([
    getMovieGenres(),
    getMoviesByGenre(genreId, page),
  ]);

  const genre = genres.find((g) => g.id === genreId);
  if (!genre) notFound();

  const movies = moviesPage.results;
  const { totalPages, totalResults } = moviesPage;

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-10 pb-20 sm:px-8">
      <Link
        href="/genres"
        className="text-sm text-cream/50 transition-colors hover:text-amber"
      >
        ← All genres
      </Link>

      <h1 className="mt-4 font-display text-5xl tracking-wide text-cream uppercase sm:text-6xl">
        {genre.name}
      </h1>
      <p className="mt-2 text-sm text-cream/55">
        Sorted by popularity on TMDB
        {totalResults > 0
          ? ` · ${totalResults.toLocaleString()} titles`
          : null}
      </p>

      {movies.length === 0 ? (
        <p className="mt-14 text-cream/50">No movies found for this genre.</p>
      ) : (
        <>
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5 md:grid-cols-5 lg:grid-cols-6">
            {movies.map((movie) => (
              <li key={movie.id}>
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  posterPath={movie.poster_path}
                  voteAverage={movie.vote_average}
                  showTitle
                />
              </li>
            ))}
          </ul>

          <PaginationNav
            page={page}
            totalPages={totalPages}
            prevHref={page > 1 ? `/genres/${genreId}?page=${page - 1}` : null}
            nextHref={
              page < totalPages
                ? `/genres/${genreId}?page=${page + 1}`
                : null
            }
          />
        </>
      )}
    </main>
  );
}
