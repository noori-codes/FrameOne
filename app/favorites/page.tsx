import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FavoriteMetaForm } from "@/components/favorite-meta-form";
import { ListPageNav } from "@/components/list-page-nav";
import { MovieCard } from "@/components/movie-card";
import { LIST_FAVORITE } from "@/lib/lists";
import { prisma } from "@/lib/prisma";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id, listType: LIST_FAVORITE },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-10 pb-20 sm:px-8">
      <h1 className="font-display text-5xl tracking-wide text-cream uppercase sm:text-6xl">
        Favorites
      </h1>
      <p className="mt-3 max-w-lg text-cream/55">
        Movies you loved — rate them and leave a short note.
      </p>

      <ListPageNav active="favorites" />

      {favorites.length === 0 ? (
        <div className="mt-14">
          <p className="text-cream/50">
            Nothing here yet. Open a movie and tap{" "}
            <span className="text-cream/80">Add to favorites</span>.
          </p>
          <Link
            href="/#trending"
            className="mt-8 inline-flex w-fit rounded-full border border-cream/20 px-4 py-2 text-sm text-cream/80 transition-colors hover:border-amber hover:text-amber"
          >
            Browse trending
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <li
              key={fav.id}
              className="rounded-2xl border border-cream/10 bg-stage/40 p-4"
            >
              <div className="mx-auto max-w-44">
                <MovieCard
                  id={fav.movieId}
                  title={fav.title}
                  posterPath={fav.posterPath}
                  voteAverage={fav.rating ?? undefined}
                  showTitle
                />
              </div>
              {fav.rating != null || fav.note ? (
                <p className="mt-3 text-center text-xs text-cream/45">
                  {fav.rating != null ? (
                    <span className="text-amber">Your ★ {fav.rating}/10</span>
                  ) : null}
                  {fav.rating != null && fav.note ? " · " : null}
                  {fav.note ? (
                    <span className="line-clamp-2 text-cream/55">{fav.note}</span>
                  ) : null}
                </p>
              ) : null}
              <FavoriteMetaForm
                movieId={fav.movieId}
                initialRating={fav.rating}
                initialNote={fav.note}
                compact
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
