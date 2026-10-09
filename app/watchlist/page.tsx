import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ListPageNav } from "@/components/list-page-nav";
import { MovieCard } from "@/components/movie-card";
import { LIST_WATCHLIST } from "@/lib/lists";
import { prisma } from "@/lib/prisma";

export default async function WatchlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const items = await prisma.favorite.findMany({
    where: { userId: session.user.id, listType: LIST_WATCHLIST },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col">
      <div className="border-b border-cream/8 bg-stage/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-cream sm:text-5xl md:text-6xl">
                Watchlist
              </h1>
              <p className="mt-2 text-sm text-cream/50">
                {items.length === 0
                  ? "Titles you want to watch later — separate from favorites."
                  : `${items.length} ${items.length === 1 ? "title" : "titles"} queued up`}
              </p>
            </div>
            <ListPageNav active="watchlist" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        {items.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border border-cream/10 bg-stage/40 px-6 py-14 sm:px-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-linear-to-br from-amber/10 via-transparent to-transparent"
            />
            <div className="relative max-w-md">
              <h2 className="text-2xl font-semibold tracking-tight text-cream">
                Watchlist is empty
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-cream/50">
                Open a movie and tap{" "}
                <span className="text-cream/75">Add to watchlist</span>.
              </p>
              <Link
                href="/#trending"
                className="mt-8 inline-flex rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-[color:var(--on-amber)] transition-colors hover:bg-(--amber-dim) hover:text-cream"
              >
                Browse trending
              </Link>
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item) => (
              <li key={item.id}>
                <MovieCard
                  id={item.movieId}
                  title={item.title}
                  posterPath={item.posterPath}
                  mediaType={item.mediaType === "tv" ? "tv" : "movie"}
                  showTitle
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
