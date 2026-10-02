import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaginationNav, parsePageParam } from "@/components/pagination-nav";
import {
  getMovieGenres,
  getMoviesByGenre,
  posterUrl,
} from "@/lib/tmdb";

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
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-24 pb-16">
      <Link
        href="/genres"
        className="text-sm text-cream/50 transition-colors hover:text-amber"
      >
        ← All genres
      </Link>

      <h1 className="mt-3 font-display text-4xl tracking-wide text-cream sm:text-5xl">
        {genre.name}
      </h1>
      <p className="mt-2 text-sm text-cream/55">
        Sorted by popularity on TMDB
        {totalResults > 0
          ? ` · ${totalResults.toLocaleString()} titles`
          : null}
      </p>

      {movies.length === 0 ? (
        <p className="mt-12 text-cream/50">No movies found for this genre.</p>
      ) : (
        <>
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {movies.map((movie) => {
              const src = posterUrl(movie.poster_path);
              return (
                <li key={movie.id}>
                  <Link href={`/movie/${movie.id}`} className="group block">
                    <div className="relative aspect-2/3 overflow-hidden rounded-sm bg-stage ring-1 ring-cream/10 transition-[box-shadow,transform] group-hover:scale-[1.03] group-hover:ring-amber/50">
                      {src ? (
                        <Image
                          src={src}
                          alt={movie.title}
                          fill
                          sizes="160px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center p-2 text-center text-xs text-cream/40">
                          {movie.title}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-cream/70 group-hover:text-cream">
                      {movie.title}
                    </p>
                  </Link>
                </li>
              );
            })}
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
