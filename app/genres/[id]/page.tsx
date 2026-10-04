import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GenreChips } from "@/components/genre-chips";
import { GenreInfiniteGrid } from "@/components/genre-infinite-grid";
import { GenreSortNav } from "@/components/genre-sort-nav";
import {
  GENRE_SORTS,
  getMovieGenres,
  getMoviesByGenre,
  parseGenreSort,
} from "@/lib/tmdb";

type GenrePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: GenrePageProps): Promise<Metadata> {
  const { id } = await params;
  const { sort: sortRaw } = await searchParams;
  const genres = await getMovieGenres();
  const genre = genres.find((g) => String(g.id) === id);
  const sort = parseGenreSort(sortRaw);
  const sortLabel = GENRE_SORTS.find((s) => s.id === sort)?.label;
  return {
    title: genre
      ? sort === "popular"
        ? genre.name
        : `${genre.name} · ${sortLabel}`
      : "Genre",
  };
}

export default async function GenrePage({
  params,
  searchParams,
}: GenrePageProps) {
  const { id } = await params;
  const { sort: sortRaw } = await searchParams;
  const genreId = Number(id);
  const sort = parseGenreSort(sortRaw);

  if (!Number.isFinite(genreId) || genreId <= 0) notFound();

  const [genres, initial] = await Promise.all([
    getMovieGenres(),
    getMoviesByGenre(genreId, 1, sort),
  ]);

  const genre = genres.find((g) => g.id === genreId);
  if (!genre) notFound();

  const sortLabel =
    GENRE_SORTS.find((s) => s.id === sort)?.label ?? "Popular";

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col">
      <div className="border-b border-cream/8 bg-stage/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
          <Link
            href="/genres"
            className="text-sm text-cream/45 transition-colors hover:text-amber"
          >
            ← All genres
          </Link>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-cream sm:text-5xl md:text-6xl">
                {genre.name}
              </h1>
              <p className="mt-2 text-sm text-cream/50">
                {sortLabel} on TMDB
                {initial.totalResults > 0
                  ? ` · ${initial.totalResults.toLocaleString()} titles`
                  : null}
              </p>
            </div>

            <GenreSortNav genreId={genreId} active={sort} />
          </div>

          <GenreChips
            genres={genres}
            activeId={genreId}
            sort={sort}
            className="mt-8"
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <GenreInfiniteGrid
          key={`${genreId}-${sort}`}
          genreId={genreId}
          sort={sort}
          initial={initial}
        />
      </div>
    </main>
  );
}
