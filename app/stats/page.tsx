import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChartColumn,
  Clapperboard,
  Star,
} from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PAGE_GUTTER } from "@/lib/layout";
import { mediaHref } from "@/lib/lists";
import {
  getUserStatsYears,
  getUserYearStats,
  resolveStatsYear,
} from "@/lib/user-stats";
import { posterUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your year",
  description: "Year-in-review stats from your FrameOne diary and ratings.",
};

type StatsPageProps = {
  searchParams: Promise<{ year?: string }>;
};

const MONTH_LABELS = [
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

function buildHeatmapDays(year: number, dailyCounts: Record<string, number>) {
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));
  /** Pad so the grid starts on Sunday (UTC). */
  const pad = start.getUTCDay();
  const cells: {
    key: string;
    count: number;
    inYear: boolean;
    label: string;
  }[] = [];

  for (let i = 0; i < pad; i++) {
    cells.push({
      key: `pad-${i}`,
      count: 0,
      inYear: false,
      label: "",
    });
  }

  for (
    let cursor = new Date(start);
    cursor < end;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    const key = cursor.toISOString().slice(0, 10);
    cells.push({
      key,
      count: dailyCounts[key] ?? 0,
      inYear: true,
      label: key,
    });
  }

  return cells;
}

function heatClass(count: number, max: number) {
  if (count <= 0 || max <= 0) return "bg-cream/[0.04] ring-cream/8";
  const t = count / max;
  if (t < 0.25) return "bg-amber/25 ring-amber/20";
  if (t < 0.5) return "bg-amber/45 ring-amber/30";
  if (t < 0.75) return "bg-amber/65 ring-amber/40";
  return "bg-amber ring-amber/50";
}

export default async function StatsPage({ searchParams }: StatsPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const userId = session.user.id;
  const { year: yearRaw } = await searchParams;
  const availableYears = await getUserStatsYears(userId);
  const year = resolveStatsYear(yearRaw, availableYears);
  const stats = await getUserYearStats(userId, year);

  const maxMonth = Math.max(...stats.monthlyCounts, 1);
  const heatmap = buildHeatmapDays(year, stats.dailyCounts);
  const maxDay = Math.max(0, ...Object.values(stats.dailyCounts));
  const maxGenre = Math.max(...stats.topGenres.map((g) => g.count), 1);

  const yearIndex = stats.availableYears.indexOf(year);
  const prevYear =
    yearIndex >= 0 ? stats.availableYears[yearIndex + 1] : undefined;
  const nextYear =
    yearIndex > 0 ? stats.availableYears[yearIndex - 1] : undefined;

  const empty = stats.watchedCount === 0;

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-x-hidden bg-background">
      <header className="relative isolate overflow-hidden border-b border-cream/8">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_18%_0%,color-mix(in_srgb,var(--amber)_16%,transparent),transparent_52%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-amber/35 to-transparent"
        />
        <div className={cn("relative w-full pt-8 pb-10 sm:pt-10 sm:pb-12", PAGE_GUTTER)}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.24em] text-amber uppercase sm:text-xs">
              <ChartColumn className="size-3.5" aria-hidden />
              Year in review
            </p>
            <nav
              aria-label="Select year"
              className="inline-flex items-center gap-1 rounded-full border border-cream/12 bg-black/35 p-1 backdrop-blur-md"
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
              <span className="min-w-16 px-2 text-center font-display text-xl tracking-wide text-cream tabular-nums">
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

          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[0.9] tracking-wide text-cream uppercase sm:text-7xl md:text-8xl">
            Your year in film
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/55 sm:text-base">
            A snapshot of what you logged in {year} — diary, ratings, and taste
            patterns from your FrameOne shelf.
          </p>

          <dl className="mt-8 flex flex-wrap gap-3 sm:gap-4">
            <div className="min-w-[7rem] rounded-2xl border border-cream/10 bg-black/30 px-4 py-3 backdrop-blur-md">
              <dt className="text-[10px] font-semibold tracking-[0.16em] text-cream/40 uppercase">
                Watched
              </dt>
              <dd className="mt-1 font-display text-3xl tracking-wide text-cream tabular-nums">
                {stats.watchedCount}
              </dd>
            </div>
            <div className="min-w-[7rem] rounded-2xl border border-cream/10 bg-black/30 px-4 py-3 backdrop-blur-md">
              <dt className="text-[10px] font-semibold tracking-[0.16em] text-cream/40 uppercase">
                Hours
              </dt>
              <dd className="mt-1 font-display text-3xl tracking-wide text-cream tabular-nums">
                {stats.estimatedHours != null ? stats.estimatedHours : "—"}
              </dd>
              {stats.estimatedHours != null ? (
                <p className="mt-1 text-[10px] text-cream/35">Estimated</p>
              ) : null}
            </div>
            <div className="min-w-[7rem] rounded-2xl border border-cream/10 bg-black/30 px-4 py-3 backdrop-blur-md">
              <dt className="text-[10px] font-semibold tracking-[0.16em] text-cream/40 uppercase">
                Avg rating
              </dt>
              <dd className="mt-1 inline-flex items-baseline gap-1 font-display text-3xl tracking-wide text-amber tabular-nums">
                {stats.avgRating != null ? stats.avgRating : "—"}
                {stats.avgRating != null ? (
                  <span className="text-base text-amber/60">/10</span>
                ) : null}
              </dd>
            </div>
            <div className="min-w-[7rem] rounded-2xl border border-cream/10 bg-black/30 px-4 py-3 backdrop-blur-md">
              <dt className="text-[10px] font-semibold tracking-[0.16em] text-cream/40 uppercase">
                Films / series
              </dt>
              <dd className="mt-1 font-display text-3xl tracking-wide text-cream tabular-nums">
                {stats.movieCount}
                <span className="mx-1 text-cream/30">/</span>
                {stats.tvCount}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <div
        className={cn(
          "relative w-full flex-1 space-y-14 py-10 sm:space-y-16 sm:py-14",
          PAGE_GUTTER,
        )}
      >
        {empty ? (
          <section className="rounded-3xl border border-cream/10 bg-black/25 px-6 py-12 text-center backdrop-blur-sm sm:px-10">
            <Clapperboard className="mx-auto size-8 text-amber/70" aria-hidden />
            <h2 className="mt-4 font-display text-3xl tracking-wide text-cream uppercase">
              No diary yet for {year}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cream/55">
              Mark titles as watched and this page fills in — monthly rhythm,
              genres, and your highest scores.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
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
                Browse titles
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section aria-labelledby="months-heading">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase">
                    Rhythm
                  </p>
                  <h2
                    id="months-heading"
                    className="mt-2 font-display text-4xl tracking-wide text-cream uppercase sm:text-5xl"
                  >
                    By month
                  </h2>
                </div>
                {stats.mostWatchedMonth ? (
                  <p className="text-sm text-cream/50">
                    Peak month{" "}
                    <span className="text-cream/85">
                      {stats.mostWatchedMonth}
                    </span>
                  </p>
                ) : null}
              </div>

              <ul className="mt-8 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-12">
                {stats.monthlyCounts.map((count, index) => {
                  const height = Math.max(8, Math.round((count / maxMonth) * 100));
                  return (
                    <li key={MONTH_LABELS[index]} className="flex flex-col items-center gap-2">
                      <div className="flex h-28 w-full items-end justify-center rounded-xl bg-cream/[0.03] ring-1 ring-cream/8">
                        <div
                          className="w-[55%] rounded-t-md bg-amber/80"
                          style={{ height: `${height}%` }}
                          title={`${count} watched`}
                        />
                      </div>
                      <span className="text-[11px] tracking-wide text-cream/45 uppercase">
                        {MONTH_LABELS[index]}
                      </span>
                      <span className="text-xs tabular-nums text-cream/70">
                        {count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section aria-labelledby="heatmap-heading">
              <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase">
                Calendar
              </p>
              <h2
                id="heatmap-heading"
                className="mt-2 font-display text-4xl tracking-wide text-cream uppercase sm:text-5xl"
              >
                Watch days
              </h2>
              <p className="mt-3 text-sm text-cream/50">
                Each cell is a day in {year}. Brighter means more titles logged.
              </p>

              <div className="mt-6 overflow-x-auto pb-2">
                <div
                  className="grid w-max grid-flow-col grid-rows-7 gap-1"
                  role="img"
                  aria-label={`Heatmap of watches in ${year}`}
                >
                  {heatmap.map((cell) => (
                    <div
                      key={cell.key}
                      title={
                        cell.inYear
                          ? `${cell.label}: ${cell.count} watched`
                          : undefined
                      }
                      className={cn(
                        "size-2.5 rounded-[3px] ring-1 sm:size-3",
                        cell.inYear
                          ? heatClass(cell.count, maxDay)
                          : "bg-transparent ring-transparent",
                      )}
                    />
                  ))}
                </div>
              </div>
            </section>

            {stats.topGenres.length > 0 ? (
              <section aria-labelledby="genres-heading">
                <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase">
                  Taste
                </p>
                <h2
                  id="genres-heading"
                  className="mt-2 font-display text-4xl tracking-wide text-cream uppercase sm:text-5xl"
                >
                  Top genres
                </h2>
                <ul className="mt-7 max-w-2xl space-y-3">
                  {stats.topGenres.map((genre) => (
                    <li key={genre.id} className="flex items-center gap-4">
                      <Link
                        href={`/genres/${genre.id}`}
                        className="w-28 shrink-0 text-sm text-cream/80 transition-colors hover:text-amber"
                      >
                        {genre.name}
                      </Link>
                      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-cream/[0.06]">
                        <div
                          className="h-full rounded-full bg-amber/75"
                          style={{
                            width: `${Math.max(8, (genre.count / maxGenre) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right text-xs tabular-nums text-cream/50">
                        {genre.count}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {stats.topRated.length > 0 ? (
              <section aria-labelledby="top-rated-heading">
                <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase">
                  Highlights
                </p>
                <h2
                  id="top-rated-heading"
                  className="mt-2 font-display text-4xl tracking-wide text-cream uppercase sm:text-5xl"
                >
                  Top rated
                </h2>
                <ul className="mt-7 flex gap-3 overflow-x-auto pb-2 sm:gap-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {stats.topRated.map((item) => {
                    const poster = posterUrl(item.posterPath, "w342");
                    return (
                      <li
                        key={`${item.mediaType}-${item.movieId}`}
                        className="w-36 shrink-0 sm:w-40"
                      >
                        <Link
                          href={mediaHref(item.mediaType, item.movieId)}
                          className="group block"
                        >
                          <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-stage ring-1 ring-cream/10 transition-[ring-color,transform] duration-300 group-hover:-translate-y-1 group-hover:ring-amber/35">
                            {poster ? (
                              <Image
                                src={poster}
                                alt={item.title}
                                fill
                                sizes="160px"
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center p-3 text-center font-display text-xl text-cream/40">
                                {item.title.slice(0, 1)}
                              </div>
                            )}
                          </div>
                          <p className="mt-2.5 line-clamp-2 text-sm font-medium text-cream/85 transition-colors group-hover:text-amber">
                            {item.title}
                          </p>
                          {item.rating != null ? (
                            <p className="mt-1 inline-flex items-center gap-1 text-xs text-amber">
                              <Star
                                className="size-3 fill-current"
                                aria-hidden
                              />
                              {item.rating}/10
                            </p>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
