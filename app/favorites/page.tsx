import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MovieCard } from "@/components/movie-card";
import { prisma } from "@/lib/prisma";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-28 pb-20 sm:px-8">
      <h1 className="font-display text-5xl tracking-wide text-cream uppercase sm:text-6xl">
        My list
      </h1>
      <p className="mt-3 text-cream/55">
        Movies you saved — stored in your local database.
      </p>

      {favorites.length === 0 ? (
        <p className="mt-14 text-cream/50">
          Nothing here yet. Open a movie and tap{" "}
          <span className="text-cream/80">Add to my list</span>.
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5 md:grid-cols-5 lg:grid-cols-6">
          {favorites.map((fav) => (
            <li key={fav.id}>
              <MovieCard
                id={fav.movieId}
                title={fav.title}
                posterPath={fav.posterPath}
                showTitle
              />
            </li>
          ))}
        </ul>
      )}

      {favorites.length === 0 ? (
        <Link
          href="/#trending"
          className="mt-8 inline-flex w-fit rounded-full border border-cream/20 px-4 py-2 text-sm text-cream/80 transition-colors hover:border-amber hover:text-amber"
        >
          Browse trending
        </Link>
      ) : null}
    </main>
  );
}
