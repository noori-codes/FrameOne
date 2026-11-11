import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FavoriteCard } from "@/components/favorite-card";
import {
  FavoritesSortNav,
  parseFavoritesSort,
} from "@/components/favorites-sort-nav";
import { ListHeaderMosaic } from "@/components/list-header-mosaic";
import { ListPageNav } from "@/components/list-page-nav";
import { RatingStars } from "@/components/rating-stars";
import { LIST_FAVORITE, mediaHref } from "@/lib/lists";
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

  const mosaic = favorites
    .filter((f) => f.posterPath)
    .slice(0, 5)
    .map((f) => posterUrl(f.posterPath, "w500"))
    .filter((src): src is string => Boolean(src));

  const featured =
    [...favorites]
      .filter((f) => f.rating != null)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0] ??
    favorites[0] ??
    null;

  const featuredPoster = featured
    ? posterUrl(featured.posterPath, "w780")
    : null;
  const featuredHref = featured
    ? mediaHref(
        featured.mediaType === "tv" ? "tv" : "movie",
        featured.movieId,
      )
    : null;

  const rated = favorites.filter((f) => f.rating != null);
  const avgRating =
    rated.length > 0
      ? rated.reduce((sum, f) => sum + (f.rating ?? 0), 0) / rated.length
      : null;
  const filmCount = favorites.filter((f) => f.mediaType !== "tv").length;
  const seriesCount = favorites.length - filmCount;
  const noteCount = favorites.filter((f) => f.note?.trim()).length;

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col bg-background">
      <header className="relative isolate overflow-hidden border-b border-cream/8">
        <ListHeaderMosaic sources={mosaic} />
        {mosaic.length === 0 ? (
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--amber)_16%,transparent),transparent_55%)]"
          />
        ) : null}

        <div className="relative w-full px-5 pt-8 pb-8 sm:px-8 sm:pt-10 sm:pb-10 lg:px-12 xl:px-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase">
                Your shelf
              </p>
              <h1 className="mt-2 font-display text-5xl leading-[0.9] tracking-wide text-cream uppercase sm:text-6xl lg:text-7xl">
                Favorites
              </h1>
              {favorites.length > 0 ? (
                <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cream/55">
                  <div className="flex items-baseline gap-1.5">
                    <dt className="sr-only">Saved</dt>
                    <dd>
                      <span className="font-medium text-cream/85">
                        {favorites.length}
                      </span>{" "}
                      saved
                    </dd>
                  </div>
                  {avgRating != null ? (
                    <div className="flex items-baseline gap-1.5">
                      <dt className="sr-only">Average rating</dt>
                      <dd>
                        <span className="font-medium text-amber">
                          {avgRating.toFixed(1)}
                        </span>{" "}
                        avg
                      </dd>
                    </div>
                  ) : null}
                  {filmCount > 0 ? (
                    <div>
                      <dt className="sr-only">Films</dt>
                      <dd>
                        {filmCount} film{filmCount === 1 ? "" : "s"}
                      </dd>
                    </div>
                  ) : null}
                  {seriesCount > 0 ? (
                    <div>
                      <dt className="sr-only">Series</dt>
                      <dd>
                        {seriesCount} series
                      </dd>
                    </div>
                  ) : null}
                  {noteCount > 0 ? (
                    <div>
                      <dt className="sr-only">Notes</dt>
                      <dd>
                        {noteCount} note{noteCount === 1 ? "" : "s"}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream/60">
                  Titles you love — rate them and leave a short note.
                </p>
              )}
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
          <section className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-6 rounded-full bg-amber/10 blur-2xl"
              />
              <div className="relative flex size-16 items-center justify-center rounded-full border border-amber/25 bg-amber/10 text-amber">
                <Heart className="size-7" aria-hidden />
              </div>
            </div>
            <h2 className="mt-8 font-display text-3xl tracking-wide text-cream uppercase sm:text-4xl">
              Start your shelf
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cream/50">
              Heart a title anywhere in FrameOne. Come back here to rate it and
              write why it stuck.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/search"
                className="cta-shine relative inline-flex overflow-hidden rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-[color:var(--on-amber)] transition-[background-color,box-shadow] hover:bg-(--amber-dim) hover:text-cream"
              >
                Find something to love
              </Link>
              <Link
                href="/genres"
                className="rounded-full border border-cream/15 px-5 py-2.5 text-sm text-cream/70 transition-colors hover:border-amber/40 hover:text-amber"
              >
                Browse genres
              </Link>
            </div>
          </section>
        ) : (
          <>
            {featured && featuredHref ? (
              <Link
                href={featuredHref}
                className="group relative mb-10 flex min-h-[14rem] overflow-hidden rounded-3xl border border-cream/10 sm:min-h-[16rem] lg:min-h-[18rem]"
              >
                {featuredPoster ? (
                  <Image
                    src={featuredPoster}
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center opacity-55 transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : null}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-r from-background via-background/80 to-background/30"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-background/95 via-transparent to-transparent"
                />

                <div className="relative z-10 flex w-full flex-col justify-end gap-5 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7 lg:p-8">
                  <div className="flex min-w-0 items-end gap-4 sm:gap-5">
                    {featuredPoster ? (
                      <div className="relative hidden aspect-2/3 w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-cream/15 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.9)] sm:block sm:w-28 lg:w-32">
                        <Image
                          src={featuredPoster}
                          alt=""
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0 max-w-2xl">
                      <p className="text-[10px] font-semibold tracking-[0.2em] text-amber uppercase">
                        {featured.rating != null ? "Top rated" : "Latest save"}
                      </p>
                      <p className="mt-2 font-display text-3xl leading-none tracking-wide text-cream uppercase sm:text-4xl lg:text-5xl">
                        {featured.title}
                      </p>
                      <div className="mt-3">
                        <RatingStars
                          value={featured.rating}
                          size="md"
                          showValue
                        />
                      </div>
                      {featured.note ? (
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-cream/60">
                          {featured.note}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cream/20 bg-black/40 px-4 py-2 text-sm text-cream/80 backdrop-blur-md transition-[border-color,color] group-hover:border-amber/45 group-hover:text-amber">
                    Open
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </span>
                </div>
              </Link>
            ) : null}

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {favorites.map((fav, i) => (
                <FavoriteCard
                  key={fav.id}
                  priority={i < 8}
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
          </>
        )}
      </div>
    </main>
  );
}
