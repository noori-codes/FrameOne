import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PAGE_GUTTER } from "@/lib/layout";
import { mediaHref } from "@/lib/lists";
import {
  getUserStatsYears,
  getUserYearStats,
  resolveStatsYear,
  type StatsShelfItem,
} from "@/lib/user-stats";
import { posterUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Stats",
  description: "Your FrameOne watching statistics and year in film.",
};

type StatsPageProps = {
  searchParams: Promise<{ year?: string }>;
};

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function PosterCard({
  item,
  sizes = "180px",
  priority = false,
  showRating = true,
}: {
  item: StatsShelfItem;
  sizes?: string;
  priority?: boolean;
  showRating?: boolean;
}) {
  const poster = posterUrl(item.posterPath, "w500");
  return (
    <Link
      href={mediaHref(item.mediaType, item.movieId)}
      className="group block min-w-0"
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-stage shadow-[0_22px_50px_-26px_rgba(0,0,0,0.95)] ring-1 ring-cream/12 transition-[ring-color,transform] duration-500 group-hover:-translate-y-1 group-hover:ring-amber/40">
        {poster ? (
          <Image
            src={poster}
            alt={item.title}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-3 font-display text-3xl text-cream/35">
            {item.title.slice(0, 1)}
          </div>
        )}
        {showRating && item.rating != null ? (
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full border border-cream/15 bg-black/60 px-2 py-1 text-[11px] font-semibold text-amber backdrop-blur-md">
            <Star className="size-3 fill-current" aria-hidden />
            {item.rating}
          </span>
        ) : null}
      </div>
      <p className="mt-2.5 line-clamp-2 text-sm font-medium text-cream/85 transition-colors group-hover:text-amber">
        {item.title}
      </p>
    </Link>
  );
}

function BigStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="flex h-full min-h-[8rem] flex-col justify-between rounded-2xl border border-cream/10 bg-black/30 px-4 py-4 backdrop-blur-md sm:min-h-[8.75rem] sm:px-5 sm:py-5">
      <p className="text-[10px] font-semibold tracking-[0.18em] text-cream/45 uppercase">
        {label}
      </p>
      <div>
        <p className="font-display text-[2.75rem] leading-none tracking-wide text-cream tabular-nums sm:text-5xl">
          {value}
        </p>
        {hint ? (
          <p className="mt-2 text-xs leading-snug text-cream/40">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  aside,
}: {
  eyebrow: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-1.5 font-display text-3xl tracking-wide text-cream uppercase sm:text-4xl">
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}

export default async function StatsPage({ searchParams }: StatsPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const userId = session.user.id;
  const { year: yearRaw } = await searchParams;
  const availableYears = await getUserStatsYears(userId);
  const year = resolveStatsYear(yearRaw, availableYears);
  const stats = await getUserYearStats(userId, year);

  const yearIndex = stats.availableYears.indexOf(year);
  const prevYear =
    yearIndex >= 0 ? stats.availableYears[yearIndex + 1] : undefined;
  const nextYear =
    yearIndex > 0 ? stats.availableYears[yearIndex - 1] : undefined;

  const empty = stats.watchedCount === 0;
  const mosaicSources = [...stats.topRated, ...stats.watchedShelf]
    .map((item) => posterUrl(item.posterPath, "w500"))
    .filter((src): src is string => Boolean(src))
    .filter((src, i, all) => all.indexOf(src) === i)
    .slice(0, 5);

  const maxMonth = Math.max(...stats.monthlyCounts, 1);
  const maxWeekday = Math.max(...stats.weekdayCounts, 1);
  const maxGenre = Math.max(...stats.topGenres.map((g) => g.count), 1);
  const maxRatingBucket = Math.max(
    ...stats.ratingDistribution.map((b) => b.count),
    1,
  );
  const hasRatings = stats.ratedCount > 0;
  const hasRatingSpread = stats.ratingDistribution.some((b) => b.count > 0);
  const activeMonths = stats.monthlyCounts
    .map((count, index) => ({ count, label: MONTH_SHORT[index]!, full: index }))
    .filter((m) => m.count > 0);

  const heroBits = [
    plural(stats.watchedCount, "title logged", "titles logged"),
    stats.estimatedHours != null ? `~${stats.estimatedHours} hours` : null,
    stats.avgRating != null ? `${stats.avgRating} avg score` : null,
    stats.mostWatchedMonth ? `peak ${stats.mostWatchedMonth}` : null,
  ].filter(Boolean);

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col overflow-x-hidden bg-background">
      <header className="relative isolate overflow-hidden border-b border-cream/8">
        {mosaicSources.length > 0 ? (
          <div
            aria-hidden
            className="absolute inset-0 -z-20 flex items-center justify-center gap-3 opacity-40 blur-[2px] sm:gap-4"
          >
            {mosaicSources.map((src, i) => (
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
        <div className="film-grain absolute inset-0 -z-10" />

        <div
          className={cn(
            "relative w-full pt-8 pb-8 sm:pt-10 sm:pb-10",
            PAGE_GUTTER,
          )}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase">
                Your watching · {year}
              </p>
              <h1 className="mt-2 font-display text-5xl leading-[0.9] tracking-wide text-cream uppercase sm:text-6xl lg:text-7xl">
                Stats
              </h1>
              {!empty ? (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cream/60 sm:text-base">
                  {heroBits.join(" · ")}.
                </p>
              ) : (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream/60">
                  No watches logged for {year} yet. Mark titles watched and your
                  stats fill in here.
                </p>
              )}
            </div>

            <nav
              aria-label="Select year"
              className="inline-flex shrink-0 items-center gap-1 self-start rounded-full border border-cream/12 bg-black/35 p-1 backdrop-blur-md lg:self-end"
            >
              {prevYear != null ? (
                <Link
                  href={`/stats?year=${prevYear}`}
                  className="inline-flex size-9 items-center justify-center rounded-full text-cream/60 transition-colors hover:bg-cream/5 hover:text-cream"
                  aria-label={`Previous year ${prevYear}`}
                >
                  <ArrowLeft className="size-4" aria-hidden />
                </Link>
              ) : (
                <span className="inline-flex size-9 items-center justify-center text-cream/20">
                  <ArrowLeft className="size-4" aria-hidden />
                </span>
              )}
              <span className="min-w-14 px-2 text-center text-sm font-medium tracking-wide text-cream tabular-nums">
                {year}
              </span>
              {nextYear != null ? (
                <Link
                  href={`/stats?year=${nextYear}`}
                  className="inline-flex size-9 items-center justify-center rounded-full text-cream/60 transition-colors hover:bg-cream/5 hover:text-cream"
                  aria-label={`Next year ${nextYear}`}
                >
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <span className="inline-flex size-9 items-center justify-center text-cream/20">
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "relative w-full flex-1 space-y-11 py-8 sm:space-y-12 sm:py-10",
          PAGE_GUTTER,
        )}
      >
        {empty ? (
          <section className="flex min-h-[45vh] flex-col items-start justify-center">
            <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase">
              Empty year
            </p>
            <h2 className="mt-2 font-display text-4xl tracking-wide text-cream uppercase sm:text-5xl">
              Start logging
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/55">
              Mark titles watched and rated — then come back for a full picture
              of {year}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/watched"
                className="inline-flex min-h-11 items-center rounded-full bg-amber px-5 text-sm font-semibold text-[color:var(--on-amber)] transition-colors hover:bg-(--amber-dim) hover:text-cream"
              >
                Open watched
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center rounded-full border border-cream/15 px-5 text-sm text-cream/75 transition-colors hover:border-amber/40 hover:text-amber"
              >
                Browse
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section aria-labelledby="numbers-heading">
              <SectionTitle eyebrow="Overview" title="Year in numbers" />
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-3.5">
                <BigStat
                  label="Watched"
                  value={stats.watchedCount}
                  hint={`${plural(stats.movieCount, "film", "films")} · ${plural(stats.tvCount, "series", "series")}`}
                />
                <BigStat
                  label="Hours"
                  value={stats.estimatedHours ?? "—"}
                  hint={
                    stats.avgMinutesPerTitle != null
                      ? `~${stats.avgMinutesPerTitle} min average`
                      : "From title runtimes"
                  }
                />
                <BigStat
                  label="Avg score"
                  value={hasRatings ? (stats.avgRating ?? "—") : "—"}
                  hint={
                    hasRatings
                      ? `${plural(stats.ratedCount, "rating", "ratings")}${
                          stats.unratedWatchedCount > 0
                            ? ` · ${stats.unratedWatchedCount} open`
                            : ""
                        }`
                      : "Favorite a title to rate"
                  }
                />
                <BigStat
                  label="Active days"
                  value={stats.activeDays}
                  hint={
                    stats.longestStreak > 1
                      ? `Streak ${plural(stats.longestStreak, "day", "days")}`
                      : "Days with a watch logged"
                  }
                />
                <BigStat
                  label="Peak month"
                  value={stats.mostWatchedMonth ?? "—"}
                  hint={
                    stats.mostWatchedMonthCount > 0
                      ? plural(stats.mostWatchedMonthCount, "title", "titles")
                      : undefined
                  }
                />
                <BigStat
                  label="Pace"
                  value={stats.avgPerActiveMonth || "—"}
                  hint={`Per active month · ${plural(stats.monthsActive, "month active", "months active")}`}
                />
                <BigStat
                  label="Busiest day"
                  value={stats.busiestWeekday ?? "—"}
                  hint="Most titles logged"
                />
                <BigStat
                  label="Film share"
                  value={`${stats.movieShare}%`}
                  hint={`${stats.tvShare}% series`}
                />
              </div>
              {!hasRatings ? (
                <p className="mt-4 text-sm text-cream/45">
                  Tip: open a title, favorite it, then leave a score — ratings
                  unlock average and top-rated here.{" "}
                  <Link href="/favorites" className="text-amber hover:underline">
                    Favorites
                  </Link>
                </p>
              ) : null}
            </section>

            {/* Bookends + weekday */}
            <section className="grid gap-8 border-t border-cream/8 pt-9 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
              <div>
                <SectionTitle eyebrow="Bookends" title="First & latest" />
                <div className="mt-5 grid grid-cols-2 gap-4 sm:gap-5">
                  {stats.firstWatched ? (
                    <div>
                      <p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-cream/40 uppercase">
                        First in {year}
                      </p>
                      <PosterCard
                        item={stats.firstWatched}
                        sizes="200px"
                        showRating={false}
                        priority
                      />
                    </div>
                  ) : null}
                  {stats.lastWatched ? (
                    <div>
                      <p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-cream/40 uppercase">
                        Latest logged
                      </p>
                      <PosterCard
                        item={stats.lastWatched}
                        sizes="200px"
                        showRating={false}
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <SectionTitle eyebrow="Rhythm" title="By weekday" />
                <ul className="mt-5 space-y-2.5">
                  {stats.weekdayCounts.map((count, index) => (
                    <li
                      key={WEEKDAY_SHORT[index]}
                      className="flex items-center gap-3"
                    >
                      <span className="w-9 shrink-0 text-xs tracking-wide text-cream/45 uppercase">
                        {WEEKDAY_SHORT[index]}
                      </span>
                      <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-cream/[0.06]">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            count > 0 ? "bg-amber/80" : "bg-transparent",
                          )}
                          style={{
                            width:
                              count > 0
                                ? `${Math.max(6, (count / maxWeekday) * 100)}%`
                                : "0%",
                          }}
                        />
                      </div>
                      <span
                        className={cn(
                          "w-5 shrink-0 text-right text-xs tabular-nums",
                          count > 0 ? "text-cream/70" : "text-cream/25",
                        )}
                      >
                        {count}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Months — compact year strip + active detail */}
            <section className="border-t border-cream/8 pt-9">
              <SectionTitle
                eyebrow="Calendar"
                title="By month"
                aside={
                  stats.mostWatchedMonth ? (
                    <p className="text-sm text-cream/50">
                      Peak{" "}
                      <span className="text-cream/85">
                        {stats.mostWatchedMonth}
                      </span>
                    </p>
                  ) : null
                }
              />

              <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
                {stats.monthlyCounts.map((count, index) => (
                  <div
                    key={MONTH_SHORT[index]}
                    className={cn(
                      "rounded-xl border px-2 py-3 text-center",
                      count > 0
                        ? "border-amber/25 bg-amber/10"
                        : "border-cream/8 bg-cream/[0.02] opacity-45",
                    )}
                  >
                    <p className="text-[10px] tracking-[0.14em] text-cream/50 uppercase">
                      {MONTH_SHORT[index]}
                    </p>
                    <p
                      className={cn(
                        "mt-1 font-display text-2xl tabular-nums",
                        count > 0 ? "text-cream" : "text-cream/30",
                      )}
                    >
                      {count}
                    </p>
                  </div>
                ))}
              </div>

              {activeMonths.length > 0 && activeMonths.length < 12 ? (
                <ul className="mt-6 max-w-xl space-y-2">
                  {activeMonths.map((month) => (
                    <li
                      key={month.label}
                      className="grid grid-cols-[3.5rem_minmax(0,1fr)_2rem] items-center gap-3"
                    >
                      <span className="text-xs tracking-wide text-cream/55 uppercase">
                        {month.label}
                      </span>
                      <div className="h-2.5 overflow-hidden rounded-full bg-cream/[0.06]">
                        <div
                          className="h-full rounded-full bg-amber/85"
                          style={{
                            width: `${Math.max(8, (month.count / maxMonth) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-right text-sm tabular-nums text-cream/75">
                        {month.count}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            {hasRatingSpread ? (
              <section className="border-t border-cream/8 pt-9">
                <SectionTitle
                  eyebrow="Scores"
                  title="Rating spread"
                  aside={
                    stats.avgRating != null ? (
                      <p className="text-sm text-cream/50">
                        Avg{" "}
                        <span className="font-medium text-amber">
                          {stats.avgRating}
                        </span>
                      </p>
                    ) : null
                  }
                />
                <ul className="mt-7 grid grid-cols-10 items-end gap-1.5 sm:gap-2">
                  {stats.ratingDistribution.map((bucket) => {
                    const height = Math.max(
                      14,
                      Math.round((bucket.count / maxRatingBucket) * 140),
                    );
                    return (
                      <li
                        key={bucket.score}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <span className="text-[10px] tabular-nums text-cream/45 sm:text-[11px]">
                          {bucket.count || "·"}
                        </span>
                        <div
                          className="w-full max-w-9 rounded-t-md bg-amber/80"
                          style={{ height }}
                          title={`${bucket.count} at ${bucket.score}/10`}
                        />
                        <span className="text-[11px] font-medium tabular-nums text-cream/65">
                          {bucket.score}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            <section
              className={cn(
                "grid gap-10 border-t border-cream/8 pt-9",
                stats.topRated.length > 0 && stats.topGenres.length > 0
                  ? "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-10"
                  : "",
              )}
            >
              {stats.topRated.length > 0 ? (
                <div>
                  <SectionTitle eyebrow="Highlights" title="Top rated" />
                  <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
                    {stats.topRated.slice(0, 6).map((item, index) => (
                      <li key={`${item.mediaType}-${item.movieId}`}>
                        <PosterCard
                          item={item}
                          sizes="(max-width: 1024px) 30vw, 200px"
                          priority={index < 3}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {stats.topGenres.length > 0 ? (
                <div>
                  <SectionTitle eyebrow="Taste" title="Top genres" />
                  <ol className="mt-6 space-y-2.5">
                    {stats.topGenres.map((genre, index) => (
                      <li key={genre.id}>
                        <Link
                          href={`/genres/${genre.id}`}
                          className="group block rounded-2xl border border-cream/8 bg-cream/[0.02] px-4 py-3 transition-[border-color,background-color] hover:border-amber/30 hover:bg-amber/5"
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="flex min-w-0 items-baseline gap-2.5">
                              <span className="font-display text-sm text-cream/30 tabular-nums">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <span className="truncate font-display text-xl tracking-wide text-cream uppercase transition-colors group-hover:text-amber sm:text-2xl">
                                {genre.name}
                              </span>
                            </span>
                            <span className="shrink-0 text-xs tabular-nums text-cream/50">
                              {genre.count} · {genre.share}%
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream/[0.06]">
                            <div
                              className="h-full rounded-full bg-amber/75"
                              style={{
                                width: `${Math.max(6, (genre.count / maxGenre) * 100)}%`,
                              }}
                            />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </section>

            {stats.watchedShelf.length > 0 ? (
              <section className="border-t border-cream/8 pt-9 pb-2">
                <SectionTitle
                  eyebrow="Diary"
                  title="Recent watches"
                  aside={
                    <Link
                      href="/watched"
                      className="text-sm text-cream/50 transition-colors hover:text-amber"
                    >
                      Full diary
                    </Link>
                  }
                />
                <ul className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
                  {stats.watchedShelf.map((item) => (
                    <li key={`${item.mediaType}-${item.movieId}`}>
                      <PosterCard
                        item={item}
                        sizes="140px"
                        showRating={false}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
