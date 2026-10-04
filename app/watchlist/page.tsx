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
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-28 pb-20 sm:px-8">
      <h1 className="font-display text-5xl tracking-wide text-cream uppercase sm:text-6xl">
        Watchlist
      </h1>
      <p className="mt-3 max-w-lg text-cream/55">
        Titles you want to watch later — separate from your favorites.
      </p>

      <ListPageNav active="watchlist" />

      {items.length === 0 ? (
        <div className="mt-14">
          <p className="text-cream/50">
            Your watchlist is empty. Open a movie and tap{" "}
            <span className="text-cream/80">Add to watchlist</span>.
          </p>
          <Link
            href="/#trending"
            className="mt-8 inline-flex w-fit rounded-full border border-cream/20 px-4 py-2 text-sm text-cream/80 transition-colors hover:border-amber hover:text-amber"
          >
            Browse trending
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5 md:grid-cols-5 lg:grid-cols-6">
          {items.map((item) => (
            <li key={item.id}>
              <MovieCard
                id={item.movieId}
                title={item.title}
                posterPath={item.posterPath}
                showTitle
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
