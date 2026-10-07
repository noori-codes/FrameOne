import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionPageLayout } from "@/components/collection-page-layout";
import { GenreChips } from "@/components/genre-chips";
import { InfiniteMovieGrid } from "@/components/infinite-movie-grid";
import { cn } from "@/lib/utils";
import {
  BROWSE_KINDS,
  type BrowseKind,
  getBrowseMoviesPage,
  isBrowseKind,
} from "@/lib/browse";
import { parsePageParam } from "@/components/pagination-nav";
import { getMovieGenres } from "@/lib/tmdb";

type BrowsePageProps = {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ page?: string }>;
};

function BrowseKindNav({ active }: { active: BrowseKind }) {
  return (
    <nav aria-label="Browse lists" className="flex flex-wrap gap-2">
      {Object.entries(BROWSE_KINDS).map(([kind, browseKind]) => {
        const isActive = kind === active;
        return (
          <Link
            key={kind}
            href={`/browse/${kind}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-amber text-[color:var(--on-amber)]"
                : "border border-cream/15 text-cream/60 hover:border-amber/50 hover:text-amber",
            )}
          >
            {browseKind.title}
          </Link>
        );
      })}
    </nav>
  );
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
  const [moviesPage, genres] = await Promise.all([
    getBrowseMoviesPage(kind, page),
    getMovieGenres(),
  ]);
  const featuredMovie = moviesPage.results.find(
    (movie) => movie.backdrop_path,
  );

  return (
    <CollectionPageLayout
      title={meta.title}
      description={meta.blurb}
      backHref="/"
      backLabel="Home"
      totalResults={moviesPage.totalResults}
      selectionLabel={kind === "trending" ? "Today’s picks" : "TMDB picks"}
      featuredMovie={featuredMovie}
      controlsLabel="Browse collection"
      controls={<BrowseKindNav active={kind} />}
      secondaryControls={<GenreChips genres={genres} />}
      resultsEyebrow="Browse collection"
      resultsTitle={meta.title}
    >
      <InfiniteMovieGrid
        key={`${kind}-${page}`}
        endpoint={`/api/browse/${kind}/movies`}
        initial={moviesPage}
      />
    </CollectionPageLayout>
  );
}
