import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FavoriteCard } from "@/components/favorite-card";
import {
  FavoritesSortNav,
  parseFavoritesSort,
} from "@/components/favorites-sort-nav";
import { ListPageNav } from "@/components/list-page-nav";
import { LIST_FAVORITE } from "@/lib/lists";
import { prisma } from "@/lib/prisma";
import { posterUrl } from "@/lib/tmdb";

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

  const cover =
    posterUrl(
      favorites.find((f) => f.posterPath)?.posterPath ?? null,
      "w780",
    ) ?? null;

  const ratedCount = favorites.filter((f) => f.rating != null).length;

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col bg-background">
      <header className="relative isolate overflow-hidden border-b border-cream/8">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 -z-20 object-cover object-[center_20%] opacity-35"
          />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-b from-background/50 via-background/85 to-background"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--amber)_14%,transparent),transparent_55%)]"
        />

        <div className="relative w-full px-5 pt-8 pb-7 sm:px-8 sm:pt-10 sm:pb-9 lg:px-12 xl:px-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase">
                Your shelf
              </p>
              <h1 className="mt-2 font-display text-5xl leading-[0.9] tracking-wide text-cream uppercase sm:text-6xl lg:text-7xl">
                Favorites
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream/60">
                {favorites.length === 0
                  ? "Titles you love — rate them and leave a short note."
                  : `${favorites.length} saved${ratedCount > 0 ? ` · ${ratedCount} rated` : ""}`}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
              <ListPageNav active="favorites" />
              {favorites.length > 0 ? (
                <FavoritesSortNav active={sort} />
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="relative w-full flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
        {favorites.length === 0 ? (
          <section className="flex min-h-[45vh] flex-col items-center justify-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full border border-amber/25 bg-amber/10 text-amber">
              <Heart className="size-6" aria-hidden />
            </div>
            <h2 className="mt-6 font-display text-3xl tracking-wide text-cream uppercase sm:text-4xl">
              Nothing here yet
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cream/50">
              Open a title and tap the heart. Ratings and notes you add will
              live on this shelf.
            </p>
            <Link
              href="/search"
              className="cta-shine group relative mt-8 inline-flex overflow-hidden rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-[color:var(--on-amber)] transition-[background-color,box-shadow] hover:bg-(--amber-dim) hover:text-cream"
            >
              Find something to love
            </Link>
          </section>
        ) : (
          <ul className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {favorites.map((fav, i) => (
              <FavoriteCard
                key={fav.id}
                priority={i < 6}
                favorite={{
                  id: fav.id,
                  movieId: fav.movieId,
                  title: fav.title,
                  posterPath: fav.posterPath,
                  rating: fav.rating,
                  note: fav.note,
                  mediaType: fav.mediaType === "tv" ? "tv" : "movie",
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
