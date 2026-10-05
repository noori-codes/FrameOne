import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MovieCard } from "@/components/movie-card";
import { PaginationNav, parsePageParam } from "@/components/pagination-nav";
import {
  getPopularMoviesPage,
  getTopRatedMoviesPage,
  getTrendingMoviesPage,
} from "@/lib/tmdb";

const BROWSE_KINDS = {
  trending: {
    title: "Trending now",
    blurb: "Movies trending on TMDB today",
  },
  popular: {
    title: "Popular now",
    blurb: "Most popular movies on TMDB right now",
  },
  "top-rated": {
    title: "Top rated",
    blurb: "Highest-rated movies on TMDB",
  },
} as const;

type BrowseKind = keyof typeof BROWSE_KINDS;

type BrowsePageProps = {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ page?: string }>;
};

function isBrowseKind(value: string): value is BrowseKind {
  return value in BROWSE_KINDS;
}

export async function generateMetadata({
  params,
}: BrowsePageProps): Promise<Metadata> {
  const { kind } = await params;
  if (!isBrowseKind(kind)) return { title: "Browse" };
  return { title: BROWSE_KINDS[kind].title };
}

export default async function BrowsePage({
  params,
  searchParams,
}: BrowsePageProps) {
  const { kind } = await params;
  const { page: pageRaw } = await searchParams;
  if (!isBrowseKind(kind)) notFound();

  const page = parsePageParam(pageRaw);
  const meta = BROWSE_KINDS[kind];

  const moviesPage =
    kind === "trending"
      ? await getTrendingMoviesPage("day", page)
      : kind === "popular"
        ? await getPopularMoviesPage(page)
        : await getTopRatedMoviesPage(page);

  const movies = moviesPage.results;
  const { totalPages, totalResults } = moviesPage;

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pt-8 pb-16 sm:px-8 sm:pt-10 sm:pb-20">
      <Link
        href="/"
        className="text-sm text-cream/50 transition-colors hover:text-amber"
      >
        ← Home
      </Link>

      <h1 className="mt-4 font-display text-4xl tracking-wide wrap-break-word text-cream uppercase sm:text-6xl">
        {meta.title}
      </h1>
      <p className="mt-2 text-sm text-cream/55">
        {meta.blurb}
        {totalResults > 0
          ? ` · ${totalResults.toLocaleString()} titles`
          : null}
      </p>

      {movies.length === 0 ? (
        <p className="mt-14 text-cream/50">No movies found.</p>
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
            prevHref={page > 1 ? `/browse/${kind}?page=${page - 1}` : null}
            nextHref={
              page < totalPages ? `/browse/${kind}?page=${page + 1}` : null
            }
          />
        </>
      )}
    </main>
  );
}
