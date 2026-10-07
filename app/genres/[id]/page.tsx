import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clapperboard, Sparkles } from "lucide-react";
import { GenreChips } from "@/components/genre-chips";
import { InfiniteMovieGrid } from "@/components/infinite-movie-grid";
import { GenreSortNav } from "@/components/genre-sort-nav";
import {
  GENRE_SORTS,
  backdropUrl,
  getMovieGenres,
  getMoviesByGenre,
  parseGenreSort,
  posterUrl,
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
  const featuredMovie =
    initial.results.find((movie) => movie.backdrop_path) ?? initial.results[0];
  const featuredBackdrop = backdropUrl(featuredMovie?.backdrop_path ?? null);
  const featuredPoster = posterUrl(featuredMovie?.poster_path ?? null, "w500");

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col">
      <section className="relative isolate overflow-hidden border-b border-cream/10 bg-stage">
        {featuredBackdrop ? (
          <Image
            src={featuredBackdrop}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="absolute inset-0 -z-20 object-cover object-center opacity-40"
          />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-r from-background via-background/90 to-background/45"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-t from-background via-background/20 to-background/35"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_40%,rgba(47,230,200,0.13),transparent_42%)]"
        />

        <div className="grid min-h-[350px] w-full grid-cols-1 items-end gap-8 px-3 pb-10 pt-8 sm:min-h-[390px] sm:px-5 sm:pb-12 sm:pt-10 lg:min-h-[430px] lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center lg:px-8 lg:py-12">
          <div className="relative z-10 max-w-3xl">
            <Link
              href="/genres"
              className="inline-flex items-center gap-2 text-sm text-cream/60 transition-colors hover:text-amber"
            >
              <ArrowLeft className="size-4" aria-hidden />
              All genres
            </Link>

            <p className="mt-9 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-background/40 px-3 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-amber uppercase backdrop-blur-sm sm:mt-12">
              <Sparkles className="size-3.5" aria-hidden />
              Explore the collection
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-6xl leading-[0.88] tracking-wide wrap-break-word text-cream uppercase drop-shadow-[0_8px_30px_rgba(0,0,0,0.55)] sm:text-8xl md:text-9xl">
              {genre.name}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/70 sm:text-base">
              Find your next favorite from the world of {genre.name.toLowerCase()}{" "}
              cinema.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-cream/55 sm:text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-background/35 px-3 py-1.5 backdrop-blur-sm">
                <Clapperboard className="size-4 text-amber" aria-hidden />
                {initial.totalResults.toLocaleString()} titles
              </span>
              <span className="text-cream/30" aria-hidden>
                /
              </span>
              <span>{sortLabel} picks</span>
            </div>
          </div>

          {featuredMovie && featuredPoster ? (
            <Link
              href={`/movie/${featuredMovie.id}`}
              aria-label={`View ${featuredMovie.title}`}
              className="group relative hidden w-full max-w-52 justify-self-end lg:block"
            >
              <div className="relative aspect-2/3 overflow-hidden rounded-md bg-stage shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] ring-1 ring-cream/25 transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-1">
                <Image
                  src={featuredPoster}
                  alt=""
                  fill
                  unoptimized
                  sizes="208px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-amber uppercase">
                    Featured pick
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-medium text-cream">
                    {featuredMovie.title}
                  </p>
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <section
        aria-label="Browse genres and sort"
        className="border-b border-cream/8 bg-background/80"
      >
        <div className="w-full px-3 py-5 sm:px-5 sm:py-6 lg:px-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="shrink-0 text-xs font-semibold tracking-[0.16em] text-cream/45 uppercase">
                Sort collection
              </p>
              <GenreSortNav genreId={genreId} active={sort} />
            </div>
            <GenreChips
              genres={genres}
              activeId={genreId}
              sort={sort}
              className="border-t border-cream/8 pt-4"
            />
          </div>
        </div>
      </section>

      <section className="w-full flex-1 px-3 py-8 sm:px-5 sm:py-10 lg:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b border-cream/10 pb-4 sm:mb-9 sm:pb-5">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-amber uppercase">
              Hand-picked for your next watch
            </p>
            <h2 className="mt-1 font-display text-3xl tracking-wide text-cream uppercase sm:text-4xl">
              {sortLabel} {genre.name}
            </h2>
          </div>
          <span className="text-xs text-cream/40 sm:text-sm">
            Scroll to discover more
          </span>
        </div>
        <InfiniteMovieGrid
          key={`${genreId}-${sort}`}
          endpoint={`/api/genres/${genreId}/movies`}
          sort={sort}
          initial={initial}
        />
      </section>
    </main>
  );
}
