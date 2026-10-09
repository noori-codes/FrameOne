import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FavoriteRow } from "@/components/favorite-row";
import {
  FavoritesSortNav,
  parseFavoritesSort,
} from "@/components/favorites-sort-nav";
import { ListPageNav } from "@/components/list-page-nav";
import { LIST_FAVORITE } from "@/lib/lists";
import { prisma } from "@/lib/prisma";

type FavoritesPageProps = {
  searchParams: Promise<{ sort?: string }>;
};

export default async function FavoritesPage({
  searchParams,
}: FavoritesPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { sort: sortRaw } = await searchParams;
  const sort = parseFavoritesSort(sortRaw);

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id, listType: LIST_FAVORITE },
    orderBy:
      sort === "title"
        ? { title: "asc" }
        : sort === "rating"
          ? [{ rating: "desc" }, { createdAt: "desc" }]
          : { createdAt: "desc" },
  });

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col">
      <div className="border-b border-cream/8 bg-stage/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-cream sm:text-5xl md:text-6xl">
                Favorites
              </h1>
              <p className="mt-2 text-sm text-cream/50">
                {favorites.length === 0
                  ? "Movies you love — rate them and leave a short note."
                  : `${favorites.length} ${favorites.length === 1 ? "title" : "titles"} you’ve saved`}
              </p>
            </div>
            <ListPageNav active="favorites" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        {favorites.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border border-cream/10 bg-stage/40 px-6 py-14 sm:px-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-linear-to-br from-amber/10 via-transparent to-transparent"
            />
            <div className="relative max-w-md">
              <h2 className="text-2xl font-semibold tracking-tight text-cream">
                Nothing here yet
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-cream/50">
                Open a movie and tap{" "}
                <span className="text-cream/75">Add to favorites</span>. Your
                ratings and notes will live here.
              </p>
              <Link
                href="/#trending"
                className="mt-8 inline-flex rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-[color:var(--on-amber)] transition-colors hover:bg-(--amber-dim) hover:text-cream"
              >
                Find something to love
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-end">
              <FavoritesSortNav active={sort} />
            </div>

            <ul className="divide-y divide-cream/8 border-t border-cream/8">
              {favorites.map((fav) => (
                <FavoriteRow
                  key={fav.id}
                  favorite={{
                    id: fav.id,
                    movieId: fav.movieId,
                    title: fav.title,
                    posterPath: fav.posterPath,
                    rating: fav.rating,
                    note: fav.note,
                    mediaType:
                      fav.mediaType === "tv" ? "tv" : "movie",
                  }}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
