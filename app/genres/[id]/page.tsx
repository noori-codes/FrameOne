import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionPageLayout } from "@/components/collection-page-layout";
import { GenreChips } from "@/components/genre-chips";
import { InfiniteMovieGrid } from "@/components/infinite-movie-grid";
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
  const featuredMovie = initial.results.find((movie) => movie.backdrop_path);

  return (
    <CollectionPageLayout
      title={genre.name}
      description={`Find your next favorite from the world of ${genre.name.toLowerCase()} cinema.`}
      backHref="/genres"
      backLabel="All genres"
      totalResults={initial.totalResults}
      selectionLabel={`${sortLabel} picks`}
      featuredMovie={featuredMovie}
      controlsLabel="Sort collection"
      controls={<GenreSortNav genreId={genreId} active={sort} />}
      secondaryControls={
        <GenreChips
          genres={genres}
          activeId={genreId}
          sort={sort}
        />
      }
      resultsEyebrow="Browse collection"
      resultsTitle={`${sortLabel} ${genre.name}`}
    >
        <InfiniteMovieGrid
          key={`${genreId}-${sort}`}
          endpoint={`/api/genres/${genreId}/movies`}
          sort={sort}
          initial={initial}
        />
    </CollectionPageLayout>
  );
}
