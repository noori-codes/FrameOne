import Link from "next/link";
import { InfiniteMovieGrid } from "@/components/infinite-movie-grid";
import { getHomeMovieFavoriteIds } from "@/lib/home-favorites";
import { MEDIA_MOVIE } from "@/lib/lists";
import {
  excludeTitleIds,
  getUserWatchedIds,
} from "@/lib/taste-recommendations";
import { getPopularMoviesPage } from "@/lib/tmdb";

/**
 * Home “keep scrolling” grid — continues past the curated rows.
 * Starts at popular page 2 so page 1 isn’t a near-duplicate of the Popular row.
 */
export async function HomeEndlessFeed() {
  let initial;
  try {
    const [page, favoriteIds, watchedIds] = await Promise.all([
      getPopularMoviesPage(2),
      getHomeMovieFavoriteIds(),
      getUserWatchedIds(MEDIA_MOVIE),
    ]);
    initial = {
      page: {
        ...page,
        results: excludeTitleIds(page.results, watchedIds),
      },
      favoriteIds,
      watchedIds,
    };
  } catch (err) {
    console.warn("Home endless feed failed:", err);
    return null;
  }

  const { page: moviesPage, favoriteIds, watchedIds } = initial;
  if (moviesPage.results.length === 0) return null;

  return (
    <section
      aria-labelledby="endless-feed-heading"
      className="border-t border-cream/10 pt-12 sm:pt-16"
    >
      <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase sm:text-xs">
              Keep going
            </p>
            <h2
              id="endless-feed-heading"
              className="mt-2 font-display text-4xl text-cream uppercase sm:text-5xl"
            >
              Discover more
            </h2>
            <p className="mt-2 max-w-md text-sm text-cream/50">
              Scroll for more popular titles — no dead end.
            </p>
          </div>
          <Link
            href="/browse/popular"
            className="text-sm text-cream/55 transition-colors hover:text-amber"
          >
            Full popular list →
          </Link>
        </div>

        <InfiniteMovieGrid
          endpoint="/api/browse/popular/movies"
          initial={moviesPage}
          favoriteIds={favoriteIds}
          excludeIds={watchedIds}
          showCount={false}
        />
      </div>
    </section>
  );
}
