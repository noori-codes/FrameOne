import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InfiniteMovieGrid } from "@/components/infinite-movie-grid";
import {
  BROWSE_KINDS,
  getBrowseMoviesPage,
  isBrowseKind,
} from "@/lib/browse";
import { parsePageParam } from "@/components/pagination-nav";

type BrowsePageProps = {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ page?: string }>;
};

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
  const moviesPage = await getBrowseMoviesPage(kind, page);

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col">
      <div className="border-b border-cream/8 bg-stage/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
          <Link
            href="/"
            className="text-sm text-cream/45 transition-colors hover:text-amber"
          >
            ← Home
          </Link>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight wrap-break-word text-cream sm:text-5xl md:text-6xl">
            {meta.title}
          </h1>
          <p className="mt-2 text-sm text-cream/50">
            {meta.blurb}
            {moviesPage.totalResults > 0
              ? ` · ${moviesPage.totalResults.toLocaleString()} titles`
              : null}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <InfiniteMovieGrid
          key={`${kind}-${page}`}
          endpoint={`/api/browse/${kind}/movies`}
          initial={moviesPage}
        />
      </div>
    </main>
  );
}
