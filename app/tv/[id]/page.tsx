import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, Heart, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { DetailBackLink } from "@/components/detail-back-link";
import { FavoriteMetaForm } from "@/components/favorite-meta-form";
import { DetailActionRail } from "@/components/detail-action-rail";
import { MovieHeroActions } from "@/components/movie-hero-actions";
import { MovieRow } from "@/components/movie-row";
import { TitleMedia } from "@/components/title-media";
import {
  TvProgressPanel,
  type TvProgressSeasonData,
} from "@/components/tv-progress-panel";
import { WatchedDiaryForm } from "@/components/watched-diary-form";
import { WhereToWatch } from "@/components/where-to-watch";
import { MEDIA_TV } from "@/lib/lists";
import { prisma } from "@/lib/prisma";
import {
  backdropUrl,
  getMovieTrailerKeyFromVideos,
  getMovieVideoClips,
  getSimilarTv,
  getTv,
  getTvCertification,
  getTvKeywords,
  getTvSeason,
  getTvStills,
  getWatchProviders,
  mapPool,
  posterUrl,
  profileUrl,
  tvShowAsMovie,
  type TmdbCrewMember,
} from "@/lib/tmdb";

type TvPageProps = {
  params: Promise<{ id: string }>;
};

const KEY_CREW_JOBS: { job: string; label: string }[] = [
  { job: "Director", label: "Director" },
  { job: "Executive Producer", label: "Executive producer" },
  { job: "Producer", label: "Producer" },
  { job: "Writer", label: "Writer" },
  { job: "Original Music Composer", label: "Music" },
];

function formatAirDate(date: string) {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function formatEpisodeRuntime(runtimes: number[] | undefined) {
  const minutes = runtimes?.find((value) => value > 0);
  if (minutes == null) return null;
  return `~${minutes}m / ep`;
}

function formatWatchedDate(iso: Date | string | null | undefined) {
  if (!iso) return null;
  const parsed = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function Fact({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-cream/10 py-3 last:border-0">
      <dt className="shrink-0 text-sm text-cream/45">{label}</dt>
      <dd className="min-w-0 wrap-break-word text-right text-sm leading-relaxed text-cream/85">
        {value}
      </dd>
    </div>
  );
}

function pickKeyCrew(crew: TmdbCrewMember[] | undefined) {
  if (!crew?.length) return [];
  const out: { label: string; person: TmdbCrewMember }[] = [];
  const used = new Set<string>();
  for (const { job, label } of KEY_CREW_JOBS) {
    const matches = crew.filter((person) => person.job === job);
    for (const person of matches.slice(0, job.includes("Producer") ? 2 : 1)) {
      const key = `${person.id}-${person.job}`;
      if (used.has(key)) continue;
      used.add(key);
      out.push({ label, person });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: TvPageProps): Promise<Metadata> {
  const { id } = await params;
  const show = await getTv(id);
  if (!show) return { title: "Series not found" };
  return {
    title: show.name,
    description: show.overview.slice(0, 160),
  };
}

/** Series detail — trailer, lists, cast, media, similar. */
export default async function TvPage({ params }: TvPageProps) {
  const { id } = await params;
  const show = await getTv(id, {
    appendToResponse: [
      "credits",
      "videos",
      "images",
      "keywords",
      "content_ratings",
      "external_ids",
    ],
  });
  if (!show) notFound();

  const session = await auth();
  const userId = session?.user?.id;

  const seasonSummaries = (show.seasons ?? []).filter(
    (season) => season.episode_count > 0,
  );

  const [favorite, watchlistItem, watchedItem, similar, watchOffer, seasonDetails, episodeWatches] =
    await Promise.all([
      userId
        ? prisma.favorite.findUnique({
            where: {
              userId_movieId_listType_mediaType: {
                userId,
                movieId: show.id,
                listType: "favorite",
                mediaType: MEDIA_TV,
              },
            },
          })
        : Promise.resolve(null),
      userId
        ? prisma.favorite.findUnique({
            where: {
              userId_movieId_listType_mediaType: {
                userId,
                movieId: show.id,
                listType: "watchlist",
                mediaType: MEDIA_TV,
              },
            },
          })
        : Promise.resolve(null),
      userId
        ? prisma.favorite.findUnique({
            where: {
              userId_movieId_listType_mediaType: {
                userId,
                movieId: show.id,
                listType: "watched",
                mediaType: MEDIA_TV,
              },
            },
          })
        : Promise.resolve(null),
      getSimilarTv(show.id, 20),
      getWatchProviders("tv", show.id),
      mapPool(seasonSummaries, 4, async (season) => {
        const detail = await getTvSeason(show.id, season.season_number);
        return {
          ...season,
          episodes: detail?.episodes ?? [],
        } satisfies TvProgressSeasonData;
      }),
      userId
        ? prisma.tvEpisodeWatch.findMany({
            where: { userId, showId: show.id },
            select: {
              seasonNumber: true,
              episodeNumber: true,
            },
          })
        : Promise.resolve([]),
    ]);

  const progressSeasons = seasonDetails;
  const watchedKeys = episodeWatches.map(
    (row) => `${row.seasonNumber}:${row.episodeNumber}`,
  );

  const trailerKey = getMovieTrailerKeyFromVideos(show.videos?.results);
  const clips = getMovieVideoClips(show.videos?.results);
  const stills = getTvStills(show);
  const keywords = getTvKeywords(show);
  const certification = getTvCertification(show);

  const poster = posterUrl(show.poster_path, "w500");
  const backdrop = backdropUrl(show.backdrop_path);
  const firstAirYear = show.first_air_date?.slice(0, 4) || null;
  const episodeRuntime = formatEpisodeRuntime(show.episode_run_time);
  const creators = show.created_by?.slice(0, 3) ?? [];
  const cast = show.credits?.cast.slice(0, 16) ?? [];
  const keyCrew = pickKeyCrew(show.credits?.crew);
  const language =
    show.spoken_languages?.find(
      (item) => item.iso_639_1 === show.original_language,
    )?.english_name ?? show.original_language?.toUpperCase();
  const networks = show.networks?.map((network) => network.name).join(", ");
  const companies = show.production_companies
    ?.map((company) => company.name)
    .join(", ");
  const countries = show.production_countries
    ?.map((country) => country.name)
    .join(", ");
  const imdbId = show.external_ids?.imdb_id ?? null;
  const watchedDate = formatWatchedDate(watchedItem?.watchedAt);
  const signedIn = Boolean(session?.user);
  const seasonsLabel =
    show.number_of_seasons != null
      ? `${show.number_of_seasons} ${
          show.number_of_seasons === 1 ? "season" : "seasons"
        }${
          show.number_of_episodes != null
            ? ` · ${show.number_of_episodes} eps`
            : ""
        }`
      : null;

  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <section className="movie-detail-hero relative isolate flex flex-col overflow-hidden border-b border-cream/10">
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            sizes="100vw"
            className="pointer-events-none object-cover object-[center_28%]"
          />
        ) : null}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(9,8,7,0.96)_0%,rgba(9,8,7,0.72)_48%,rgba(9,8,7,0.24)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#090807_0%,rgba(9,8,7,0.48)_28%,transparent_72%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(9,8,7,0.42)_0%,transparent_22%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_82%_30%,color-mix(in_srgb,var(--amber)_14%,transparent),transparent_48%)]"
        />
        <div aria-hidden className="film-grain absolute inset-0 opacity-70" />

        <div className="relative mx-auto flex w-full flex-1 flex-col px-5 pb-6 pt-16 sm:px-8 sm:pb-10 sm:pt-20 lg:px-12 lg:pb-12 lg:pt-24 xl:px-16">
          <DetailBackLink />

          <div className="mt-auto grid grid-cols-1 items-end gap-7 pt-8 sm:gap-10 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12 lg:pt-12 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 lg:pb-2">
              <div className="relative mb-5 w-[5.5rem] sm:mb-6 sm:w-28 lg:hidden">
                <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-stage shadow-[0_20px_50px_-24px_rgba(0,0,0,0.95)] ring-1 ring-cream/20">
                  {poster ? (
                    <Image
                      src={poster}
                      alt={show.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-2 text-center font-display text-lg text-cream/45">
                      {show.name.slice(0, 1)}
                    </div>
                  )}
                </div>
              </div>

              <p className="hero-line hero-line-1 mb-3 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] text-amber uppercase sm:text-xs">
                <span className="h-px w-5 bg-amber/70" aria-hidden />
                FrameOne <span className="px-1 text-cream/35">/</span> Series
              </p>

              <h1 className="hero-line hero-line-2 max-w-4xl font-display text-4xl leading-[0.9] text-balance wrap-break-word text-cream uppercase drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)] sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-8xl">
                {show.name}
              </h1>

              {show.tagline ? (
                <p className="hero-line hero-line-3 mt-2 max-w-2xl text-sm leading-relaxed text-cream/70 italic sm:mt-3 sm:text-base">
                  “{show.tagline}”
                </p>
              ) : null}

              <div className="hero-line hero-line-3 mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-cream/80 sm:mt-5 sm:gap-x-4 sm:text-sm">
                {certification ? (
                  <span className="inline-flex min-h-8 items-center rounded border border-cream/25 bg-black/35 px-2 font-semibold tracking-wide text-cream/90 backdrop-blur-sm">
                    {certification}
                  </span>
                ) : null}
                {firstAirYear ? (
                  <span className="text-cream/75">{firstAirYear}</span>
                ) : null}
                {episodeRuntime ? (
                  <span className="inline-flex items-center gap-1.5 text-cream/75">
                    <Clock3 className="size-3.5 text-amber/80" aria-hidden />
                    {episodeRuntime}
                  </span>
                ) : null}
                {seasonsLabel ? (
                  <span className="text-cream/65">{seasonsLabel}</span>
                ) : null}
                <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-amber/35 bg-black/35 px-2.5 text-amber backdrop-blur-md sm:min-h-9 sm:px-3">
                  <Star
                    className="size-3.5 fill-current sm:size-4"
                    aria-hidden
                  />
                  <strong>{show.vote_average.toFixed(1)}</strong>
                  <span className="text-amber/65">TMDB</span>
                </span>
              </div>

              {show.genres.length > 0 ? (
                <div className="hero-line hero-line-4 mt-3 flex flex-wrap gap-2 sm:mt-4">
                  {show.genres.map((genre) => (
                    <Link
                      key={genre.id}
                      href={`/genres/${genre.id}`}
                      className="inline-flex min-h-8 items-center rounded-full border border-cream/15 bg-cream/[0.03] px-3 text-xs text-cream/75 transition-[border-color,color,background-color] hover:border-amber/40 hover:bg-amber/10 hover:text-amber sm:min-h-9 sm:text-sm"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              ) : null}

              {show.overview ? (
                <p className="hero-line hero-line-4 mt-4 line-clamp-3 max-w-2xl text-sm leading-relaxed text-cream/72 sm:mt-5 sm:text-base sm:leading-7">
                  {show.overview}
                </p>
              ) : null}

              <div className="hero-line hero-line-5 mt-5 sm:mt-6">
                <DetailActionRail label={`${show.name} actions`}>
                  <MovieHeroActions
                    movieId={show.id}
                    title={show.name}
                    posterPath={show.poster_path}
                    trailerKey={trailerKey}
                    watchOffer={watchOffer}
                    mediaType={MEDIA_TV}
                    initialFavorite={Boolean(favorite)}
                    initialWatchlist={Boolean(watchlistItem)}
                    initialWatched={Boolean(watchedItem)}
                    signedIn={signedIn}
                  />
                </DetailActionRail>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--amber)_26%,transparent),transparent_68%)] blur-2xl"
              />
              <div className="relative aspect-2/3 w-full overflow-hidden rounded-xl bg-stage shadow-[0_36px_90px_-24px_rgba(0,0,0,0.95)] ring-1 ring-cream/20">
                {poster ? (
                  <Image
                    src={poster}
                    alt={show.name}
                    fill
                    sizes="320px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-5 text-center font-display text-3xl text-cream/45">
                    {show.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full gap-10 border-t border-cream/10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:px-12 lg:py-16 xl:grid-cols-[minmax(0,1fr)_320px] xl:px-16">
        <div className="min-w-0 space-y-14 sm:space-y-16">
          <section aria-labelledby="overview-heading">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-amber uppercase sm:text-xs">
              The story
            </p>
            <h2
              id="overview-heading"
              className="mt-2 font-display text-4xl text-cream uppercase sm:text-5xl"
            >
              Overview
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-cream/75 sm:text-lg sm:leading-9">
              {show.overview || "No synopsis is available for this series yet."}
            </p>
            {creators.length > 0 ? (
              <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-cream/10 pt-5">
                <p className="text-sm text-cream/50">
                  Created by{" "}
                  <span className="ml-2 text-cream/85">
                    {creators.map((person, i) => (
                      <span key={person.id}>
                        {i > 0 ? ", " : null}
                        <Link
                          href={`/person/${person.id}`}
                          className="transition-colors hover:text-amber"
                        >
                          {person.name}
                        </Link>
                      </span>
                    ))}
                  </span>
                </p>
              </div>
            ) : null}
          </section>

          <TitleMedia title={show.name} clips={clips} stills={stills} />

          {cast.length > 0 ? (
            <section
              aria-labelledby="cast-heading"
              className="border-t border-cream/10 pt-8 sm:pt-10"
            >
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase sm:text-xs">
                    The people
                  </p>
                  <h2
                    id="cast-heading"
                    className="mt-2 font-display text-4xl text-cream uppercase sm:text-5xl"
                  >
                    Cast
                  </h2>
                </div>
                <span className="text-xs text-cream/40">
                  {cast.length} featured
                </span>
              </div>
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
                {cast.map((person) => {
                  const profile = profileUrl(person.profile_path);
                  return (
                    <li
                      key={`${person.id}-${person.character}`}
                      className="min-w-0"
                    >
                      <Link
                        href={`/person/${person.id}`}
                        className="group block min-w-0"
                      >
                        <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-stage shadow-[0_16px_36px_-20px_rgba(0,0,0,0.8)] ring-1 ring-cream/10 transition-[ring-color,transform,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:ring-amber/30">
                          {profile ? (
                            <Image
                              src={profile}
                              alt={person.name}
                              fill
                              sizes="(max-width: 640px) 42vw, (max-width: 1024px) 25vw, 180px"
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center font-display text-4xl text-cream/30">
                              {person.name.slice(0, 1)}
                            </div>
                          )}
                        </div>
                        <p className="mt-2.5 truncate text-sm font-medium text-cream/90 transition-colors group-hover:text-amber">
                          {person.name}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-cream/45">
                          {person.character || "Cast"}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {keyCrew.length > 0 ? (
                <div className="mt-10 border-t border-cream/10 pt-8">
                  <h3 className="font-display text-2xl tracking-wide text-cream uppercase sm:text-3xl">
                    Key crew
                  </h3>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {keyCrew.map(({ label, person }) => (
                      <li
                        key={`${person.id}-${person.job}`}
                        className="flex items-baseline justify-between gap-3 border-b border-cream/8 py-2.5"
                      >
                        <span className="shrink-0 text-xs tracking-wide text-cream/40 uppercase">
                          {label}
                        </span>
                        <Link
                          href={`/person/${person.id}`}
                          className="min-w-0 truncate text-right text-sm text-cream/85 transition-colors hover:text-amber"
                        >
                          {person.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          {keywords.length > 0 ? (
            <section
              aria-labelledby="keywords-heading"
              className="border-t border-cream/10 pt-8 sm:pt-10"
            >
              <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase sm:text-xs">
                Themes
              </p>
              <h2
                id="keywords-heading"
                className="mt-2 font-display text-3xl text-cream uppercase sm:text-4xl"
              >
                Keywords
              </h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <li key={keyword.id}>
                    <span className="inline-flex min-h-8 items-center rounded-full border border-cream/12 bg-cream/[0.02] px-3 text-xs text-cream/55">
                      {keyword.name}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {signedIn && progressSeasons.length > 0 ? (
            <TvProgressPanel
              showId={show.id}
              showName={show.name}
              seasons={progressSeasons}
              watchedKeys={watchedKeys}
            />
          ) : null}

          {!signedIn && progressSeasons.length > 0 ? (
            <section className="border-t border-cream/10 pt-8 sm:pt-10">
              <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase sm:text-xs">
                Continue
              </p>
              <h2 className="mt-2 font-display text-4xl text-cream uppercase sm:text-5xl">
                Progress
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/55">
                Sign in to check off episodes, mark whole seasons, and see what’s
                up next on {show.name}.
              </p>
              <Link
                href={`/signin?callbackUrl=${encodeURIComponent(`/tv/${show.id}`)}`}
                className="mt-5 inline-flex rounded-full border border-cream/15 px-5 py-2.5 text-sm text-cream/75 transition-colors hover:border-amber/40 hover:text-amber"
              >
                Sign in to track
              </Link>
            </section>
          ) : null}

          {signedIn ? (
            <section
              aria-labelledby="your-shelf-heading"
              className="border-t border-cream/10 pt-8 sm:pt-10"
            >
              <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase sm:text-xs">
                Your shelf
              </p>
              <h2
                id="your-shelf-heading"
                className="mt-2 font-display text-4xl text-cream uppercase sm:text-5xl"
              >
                Personal
              </h2>

              {watchedItem ? (
                <div className="mt-5 max-w-xl rounded-2xl border border-cream/12 bg-cream/[0.02] px-5 py-5">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-cream/45 uppercase">
                    Diary
                  </p>
                  {watchedDate ? (
                    <p className="mt-2 text-sm text-cream/60">
                      Last watched{" "}
                      <span className="text-cream/85">{watchedDate}</span>
                      {(watchedItem.rewatchCount ?? 0) > 0 ? (
                        <span className="text-cream/40">
                          {" "}
                          · {watchedItem.rewatchCount} rewatch
                          {watchedItem.rewatchCount === 1 ? "" : "es"}
                        </span>
                      ) : null}
                    </p>
                  ) : null}
                  <WatchedDiaryForm
                    key={`${watchedItem.id}-${watchedItem.watchedAt}-${watchedItem.note}-${watchedItem.rewatchCount}`}
                    movieId={show.id}
                    mediaType={MEDIA_TV}
                    initialWatchedAt={watchedItem.watchedAt}
                    initialNote={watchedItem.note}
                    rewatchCount={watchedItem.rewatchCount}
                    className="mt-4"
                  />
                </div>
              ) : null}

              {favorite ? (
                <FavoriteMetaForm
                  key={`${favorite.id}-${favorite.rating}-${favorite.note}`}
                  movieId={show.id}
                  mediaType={MEDIA_TV}
                  initialRating={favorite.rating}
                  initialNote={favorite.note}
                  className="mt-5 max-w-xl"
                />
              ) : (
                <div className="mt-5 flex max-w-xl flex-col gap-3 rounded-2xl border border-cream/12 bg-cream/[0.02] px-5 py-5">
                  <p className="text-sm leading-relaxed text-cream/65">
                    Favorite this series to add a rating and personal notes.
                  </p>
                  <p className="inline-flex items-center gap-2 text-xs text-cream/45">
                    <Heart className="size-3.5 text-amber/80" aria-hidden />
                    Use the heart in the hero to save it first
                  </p>
                </div>
              )}
            </section>
          ) : null}
        </div>

        <aside className="h-fit border-t border-cream/10 pt-7 lg:sticky lg:top-24 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          {watchOffer ? (
            <WhereToWatch
              offer={watchOffer}
              title={show.name}
              className="mb-8 border-b border-cream/10 pb-8"
            />
          ) : null}

          <section aria-labelledby="details-heading">
            <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase sm:text-xs">
              At a glance
            </p>
            <h2
              id="details-heading"
              className="mt-2 font-display text-4xl text-cream uppercase"
            >
              Details
            </h2>
            <dl className="mt-4">
              <Fact label="Status" value={show.status} />
              <Fact
                label="First aired"
                value={formatAirDate(show.first_air_date)}
              />
              <Fact
                label="Last aired"
                value={
                  show.last_air_date
                    ? formatAirDate(show.last_air_date)
                    : null
                }
              />
              <Fact label="Original title" value={show.original_name} />
              <Fact label="Language" value={language} />
              <Fact label="Network" value={networks} />
              <Fact label="Countries" value={countries} />
              <Fact label="Studio" value={companies} />
              <Fact label="Seasons" value={show.number_of_seasons} />
              <Fact label="Episodes" value={show.number_of_episodes} />
            </dl>

            {favorite?.rating != null ? (
              <div className="mt-7 flex items-center justify-between border-t border-cream/10 pt-5">
                <span className="text-sm text-cream/50">Your rating</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber">
                  <Star className="size-4 fill-current" aria-hidden />
                  {favorite.rating}/10
                </span>
              </div>
            ) : null}

            {show.homepage || imdbId ? (
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 border-t border-cream/10 pt-5">
                {show.homepage ? (
                  <a
                    href={show.homepage}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-cream/70 transition-colors hover:text-amber"
                  >
                    Official site{" "}
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                ) : null}
                {imdbId ? (
                  <a
                    href={`https://www.imdb.com/title/${imdbId}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-cream/70 transition-colors hover:text-amber"
                  >
                    IMDb <ArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                ) : null}
              </div>
            ) : null}
          </section>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="border-t border-cream/10 pt-10 pb-16 sm:pt-14 sm:pb-20">
          <MovieRow
            id="similar"
            title="More like this"
            subtitle="Similar titles"
            movies={similar.map(tvShowAsMovie)}
            mediaType="tv"
          />
        </section>
      ) : null}
    </main>
  );
}
