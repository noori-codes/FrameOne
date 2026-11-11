import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ListPageNav } from "@/components/list-page-nav";
import { WatchedCard } from "@/components/watched-card";
import {
  parseWatchedRange,
  WatchedRangeNav,
  watchedRangeStart,
} from "@/components/watched-range-nav";
import {
  parseWatchedSort,
  WatchedSortNav,
} from "@/components/watched-sort-nav";
import { LIST_WATCHED } from "@/lib/lists";
import { prisma } from "@/lib/prisma";
import { posterUrl } from "@/lib/tmdb";

type WatchedPageProps = {
  searchParams: Promise<{ sort?: string; range?: string }>;
};

function activityDate(watchedAt: Date | null, createdAt: Date) {
  return watchedAt ?? createdAt;
}

export default async function WatchedPage({ searchParams }: WatchedPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { sort: sortRaw, range: rangeRaw } = await searchParams;
  const sort = parseWatchedSort(sortRaw);
  const range = parseWatchedRange(rangeRaw);
  const rangeStart = watchedRangeStart(range);

  const allItems = await prisma.favorite.findMany({
    where: { userId: session.user.id, listType: LIST_WATCHED },
    orderBy:
      sort === "title"
        ? { title: "asc" }
        : [{ watchedAt: "desc" }, { createdAt: "desc" }],
  });

  const items = rangeStart
    ? allItems.filter(
        (item) => activityDate(item.watchedAt, item.createdAt) >= rangeStart,
      )
    : allItems;

  const mosaic = items
    .filter((item) => item.posterPath)
    .slice(0, 5)
    .map((item) => posterUrl(item.posterPath, "w500"))
    .filter((src): src is string => Boolean(src));

  const filmCount = items.filter((item) => item.mediaType !== "tv").length;
  const seriesCount = items.length - filmCount;
  const rewatchTotal = items.reduce(
    (sum, item) => sum + (item.rewatchCount ?? 0),
    0,
  );
  const emptyBecauseFilter = allItems.length > 0 && items.length === 0;

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col bg-background">
      <header className="relative isolate overflow-hidden border-b border-cream/8">
        {mosaic.length > 0 ? (
          <div
            aria-hidden
            className="absolute inset-0 -z-20 flex items-center justify-center gap-3 opacity-40 blur-[2px] sm:gap-4"
          >
            {mosaic.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="relative aspect-2/3 w-[18%] max-w-44 min-w-24 overflow-hidden rounded-lg"
                style={{
                  transform: `translateY(${(i % 2 === 0 ? -1 : 1) * 8}%) rotate(${(i - 2) * 3}deg)`,
                }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  priority={i < 3}
                  sizes="180px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-b from-background/40 via-background/88 to-background"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--amber)_16%,transparent),transparent_55%)]"
        />

        <div className="relative w-full px-5 pt-8 pb-8 sm:px-8 sm:pt-10 sm:pb-10 lg:px-12 xl:px-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase">
                Diary
              </p>
              <h1 className="mt-2 font-display text-5xl leading-[0.9] tracking-wide text-cream uppercase sm:text-6xl lg:text-7xl">
                Watched
              </h1>
              {allItems.length > 0 ? (
                <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cream/55">
                  <div className="flex items-baseline gap-1.5">
                    <dt className="sr-only">Logged</dt>
                    <dd>
                      <span className="font-medium text-cream/85">
                        {items.length}
                      </span>{" "}
                      {range === "all"
                        ? "logged"
                        : range === "week"
                          ? "this week"
                          : "this month"}
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
                      <dd>{seriesCount} series</dd>
                    </div>
                  ) : null}
                  {rewatchTotal > 0 ? (
                    <div>
                      <dt className="sr-only">Rewatches</dt>
                      <dd>
                        {rewatchTotal} rewatch{rewatchTotal === 1 ? "" : "es"}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream/60">
                  Titles you’ve finished — your personal watch diary.
                </p>
              )}
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
              <ListPageNav active="watched" />
              {allItems.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <WatchedRangeNav active={range} sort={sort} />
                  <WatchedSortNav active={sort} range={range} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="relative w-full flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
        {allItems.length === 0 ? (
          <section className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-6 rounded-full bg-amber/10 blur-2xl"
              />
              <div className="relative flex size-16 items-center justify-center rounded-full border border-amber/25 bg-amber/10 text-amber">
                <Check className="size-7" aria-hidden />
              </div>
            </div>
            <h2 className="mt-8 font-display text-3xl tracking-wide text-cream uppercase sm:text-4xl">
              Nothing logged yet
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cream/50">
              Open a title and tap Mark watched. Finished queue items will land
              here too — then add a short diary note or log a rewatch.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/search"
                className="cta-shine relative inline-flex overflow-hidden rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-[color:var(--on-amber)] transition-[background-color,box-shadow] hover:bg-(--amber-dim) hover:text-cream"
              >
                Find something to watch
              </Link>
              <Link
                href="/watchlist"
                className="rounded-full border border-cream/15 px-5 py-2.5 text-sm text-cream/70 transition-colors hover:border-amber/40 hover:text-amber"
              >
                Open watchlist
              </Link>
            </div>
          </section>
        ) : emptyBecauseFilter ? (
          <section className="flex min-h-[40vh] flex-col items-start justify-center">
            <h2 className="font-display text-3xl tracking-wide text-cream uppercase sm:text-4xl">
              Nothing in this range
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/50">
              No titles logged{" "}
              {range === "week" ? "in the last 7 days" : "this calendar month"}
              . Try All, or mark something watched today.
            </p>
            <Link
              href="/watched"
              className="mt-6 rounded-full border border-cream/15 px-5 py-2.5 text-sm text-cream/70 transition-colors hover:border-amber/40 hover:text-amber"
            >
              Show all watched
            </Link>
          </section>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {items.map((item, i) => (
              <WatchedCard
                key={item.id}
                priority={i < 8}
                item={{
                  id: item.id,
                  movieId: item.movieId,
                  title: item.title,
                  posterPath: item.posterPath,
                  watchedAt: item.watchedAt,
                  note: item.note,
                  rewatchCount: item.rewatchCount,
                  mediaType: item.mediaType === "tv" ? "tv" : "movie",
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
