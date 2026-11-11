import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clapperboard } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ListHeaderMosaic } from "@/components/list-header-mosaic";
import { ListPageNav } from "@/components/list-page-nav";
import { WatchlistCard } from "@/components/watchlist-card";
import {
  parseWatchlistSort,
  WatchlistSortNav,
} from "@/components/watchlist-sort-nav";
import { LIST_WATCHLIST, mediaHref } from "@/lib/lists";
import { prisma } from "@/lib/prisma";
import { posterUrl } from "@/lib/tmdb";

type WatchlistPageProps = {
  searchParams: Promise<{ sort?: string }>;
};

export default async function WatchlistPage({
  searchParams,
}: WatchlistPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { sort: sortRaw } = await searchParams;
  const sort = parseWatchlistSort(sortRaw);

  const items = await prisma.favorite.findMany({
    where: { userId: session.user.id, listType: LIST_WATCHLIST },
    orderBy: sort === "title" ? { title: "asc" } : { createdAt: "desc" },
  });

  const mosaic = items
    .filter((item) => item.posterPath)
    .slice(0, 5)
    .map((item) => posterUrl(item.posterPath, "w500"))
    .filter((src): src is string => Boolean(src));

  // “Up next” is always the most recently added, regardless of A–Z sort.
  const upNext =
    sort === "recent"
      ? (items[0] ?? null)
      : ([...items].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        )[0] ?? null);

  const upNextPoster = upNext ? posterUrl(upNext.posterPath, "w780") : null;
  const upNextHref = upNext
    ? mediaHref(upNext.mediaType === "tv" ? "tv" : "movie", upNext.movieId)
    : null;

  const filmCount = items.filter((item) => item.mediaType !== "tv").length;
  const seriesCount = items.length - filmCount;

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
                Up next
              </p>
              <h1 className="mt-2 font-display text-5xl leading-[0.9] tracking-wide text-cream uppercase sm:text-6xl lg:text-7xl">
                Watchlist
              </h1>
              {items.length > 0 ? (
                <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cream/55">
                  <div className="flex items-baseline gap-1.5">
                    <dt className="sr-only">Queued</dt>
                    <dd>
                      <span className="font-medium text-cream/85">
                        {items.length}
                      </span>{" "}
                      queued
                    </dd>
                  </div>
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
                </dl>
              ) : (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream/60">
                  Titles you want to watch later — separate from favorites.
                </p>
              )}
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
              <ListPageNav active="watchlist" />
              {items.length > 0 ? (
                <WatchlistSortNav active={sort} />
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="relative w-full flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
        {items.length === 0 ? (
          <section className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-6 rounded-full bg-amber/10 blur-2xl"
              />
              <div className="relative flex size-16 items-center justify-center rounded-full border border-amber/25 bg-amber/10 text-amber">
                <Clapperboard className="size-7" aria-hidden />
              </div>
            </div>
            <h2 className="mt-8 font-display text-3xl tracking-wide text-cream uppercase sm:text-4xl">
              Queue is empty
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cream/50">
              Save titles for later from any movie or series page — they’ll
              line up here.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/search"
                className="cta-shine relative inline-flex overflow-hidden rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-[color:var(--on-amber)] transition-[background-color,box-shadow] hover:bg-(--amber-dim) hover:text-cream"
              >
                Browse titles
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
            {upNext && upNextHref ? (
              <Link
                href={upNextHref}
                className="group relative mb-10 flex min-h-[14rem] overflow-hidden rounded-3xl border border-cream/10 sm:min-h-[16rem] lg:min-h-[18rem]"
              >
                {upNextPoster ? (
                  <Image
                    src={upNextPoster}
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
                    {upNextPoster ? (
                      <div className="relative hidden aspect-2/3 w-24 shrink-0 overflow-hidden rounded-xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.9)] ring-1 ring-cream/15 sm:block sm:w-28 lg:w-32">
                        <Image
                          src={upNextPoster}
                          alt=""
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0 max-w-2xl">
                      <p className="text-[10px] font-semibold tracking-[0.2em] text-amber uppercase">
                        Up next
                      </p>
                      <p className="mt-2 font-display text-3xl leading-none tracking-wide text-cream uppercase sm:text-4xl lg:text-5xl">
                        {upNext.title}
                      </p>
                      <p className="mt-3 text-sm text-cream/55">
                        {upNext.mediaType === "tv" ? "Series" : "Film"} · most
                        recently added
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cream/20 bg-black/40 px-4 py-2 text-sm text-cream/80 backdrop-blur-md transition-[border-color,color] group-hover:border-amber/45 group-hover:text-amber">
                    Watch
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </span>
                </div>
              </Link>
            ) : null}

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {items.map((item, i) => (
                <WatchlistCard
                  key={item.id}
                  priority={i < 8}
                  queueIndex={sort === "recent" ? i + 1 : undefined}
                  item={{
                    id: item.id,
                    movieId: item.movieId,
                    title: item.title,
                    posterPath: item.posterPath,
                    mediaType: item.mediaType === "tv" ? "tv" : "movie",
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
