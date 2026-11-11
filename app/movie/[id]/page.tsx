import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  Heart,
  Star,
} from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { DetailBackLink } from "@/components/detail-back-link";
import { FavoriteMetaForm } from "@/components/favorite-meta-form";
import { DetailActionRail } from "@/components/detail-action-rail";
import { MovieHeroActions } from "@/components/movie-hero-actions";
import { WatchedDiaryForm } from "@/components/watched-diary-form";
import { MovieRow } from "@/components/movie-row";
import { TitleMedia } from "@/components/title-media";
import { WhereToWatch } from "@/components/where-to-watch";
import { prisma } from "@/lib/prisma";
import {
  backdropUrl,
  getMovie,
  getMovieCertification,
  getMovieCollectionParts,
  getMovieKeywords,
  getMovieStills,
  getMovieTrailerKeyFromVideos,
  getMovieVideoClips,
  getSimilarMovies,
  getWatchProviders,
  posterUrl,
  profileUrl,
  type TmdbCrewMember,
} from "@/lib/tmdb";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

const KEY_CREW_JOBS: { job: string; label: string }[] = [
  { job: "Director", label: "Director" },
  { job: "Director of Photography", label: "Cinematography" },
  { job: "Original Music Composer", label: "Music" },
  { job: "Editor", label: "Editor" },
  { job: "Producer", label: "Producer" },
];

function formatReleaseDate(date: string) {
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

function formatRuntime(runtime: number | null) {
  if (runtime == null || runtime <= 0) return null;
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatMoney(amount: number | undefined) {
  if (amount == null || amount <= 0) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
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
    for (const person of matches.slice(0, job === "Producer" ? 3 : 1)) {
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
}: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovie(id);
  if (!movie) return { title: "Movie not found" };
  return {
    title: movie.title,
    description: movie.overview.slice(0, 160),
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = await getMovie(id, {
    appendToResponse: [
      "credits",
      "videos",
      "images",
      "keywords",
      "release_dates",
    ],
  });
  if (!movie) notFound();

  const session = await auth();
  const userId = session?.user?.id;
  const collectionId = movie.belongs_to_collection?.id ?? null;

  const [favorite, watchlistItem, watchedItem, similar, watchOffer, collectionParts] =
    await Promise.all([
      userId
        ? prisma.favorite.findUnique({
            where: {
              userId_movieId_listType_mediaType: {
                userId,
                movieId: movie.id,
                listType: "favorite",
                mediaType: "movie",
              },
            },
          })
        : Promise.resolve(null),
      userId
        ? prisma.favorite.findUnique({
            where: {
              userId_movieId_listType_mediaType: {
                userId,
                movieId: movie.id,
                listType: "watchlist",
                mediaType: "movie",
              },
            },
          })
        : Promise.resolve(null),
      userId
        ? prisma.favorite.findUnique({
            where: {
              userId_movieId_listType_mediaType: {
                userId,
                movieId: movie.id,
                listType: "watched",
                mediaType: "movie",
              },
            },
          })
        : Promise.resolve(null),
      getSimilarMovies(movie.id, 20),
      getWatchProviders("movie", movie.id),
      collectionId
        ? getMovieCollectionParts(collectionId)
        : Promise.resolve([]),
    ]);

  const trailerKey = getMovieTrailerKeyFromVideos(movie.videos?.results);
  const clips = getMovieVideoClips(movie.videos?.results);
  const stills = getMovieStills(movie);
  const keywords = getMovieKeywords(movie);
  const certification = getMovieCertification(movie);

  const poster = posterUrl(movie.poster_path, "w500");
  const backdrop = backdropUrl(movie.backdrop_path);
  const releaseYear = movie.release_date?.slice(0, 4) || null;
  const runtime = formatRuntime(movie.runtime);
  const director = movie.credits?.crew.find(
    (person) => person.job === "Director",
  );
  const writers = movie.credits?.crew
    .filter((person) =>
      ["Writer", "Screenplay", "Story"].includes(person.job),
    )
    .filter(
      (person, index, all) =>
        all.findIndex((other) => other.id === person.id) === index,
    )
    .slice(0, 4);
  const cast = movie.credits?.cast.slice(0, 16) ?? [];
  const keyCrew = pickKeyCrew(movie.credits?.crew);
  const language =
    movie.spoken_languages?.find(
      (item) => item.iso_639_1 === movie.original_language,
    )?.english_name ?? movie.original_language?.toUpperCase();
  const companies = movie.production_companies
    ?.map((company) => company.name)
    .join(", ");
  const countries = movie.production_countries
    ?.map((country) => country.name)
    .join(", ");
  const watchedDate = formatWatchedDate(watchedItem?.watchedAt);
  const collectionMovies = collectionParts.filter(
    (part) => part.id !== movie.id,
  );
  const signedIn = Boolean(session?.user);

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
                      alt={movie.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-2 text-center font-display text-lg text-cream/45">
                      {movie.title.slice(0, 1)}
                    </div>
                  )}
                </div>
              </div>

              <p className="hero-line hero-line-1 mb-3 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] text-amber uppercase sm:text-xs">
                <span className="h-px w-5 bg-amber/70" aria-hidden />
                FrameOne <span className="px-1 text-cream/35">/</span> Film
              </p>

              <h1 className="hero-line hero-line-2 max-w-4xl font-display text-4xl leading-[0.9] text-balance wrap-break-word text-cream uppercase drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)] sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-8xl">
                {movie.title}
              </h1>

              {movie.tagline ? (
                <p className="hero-line hero-line-3 mt-2 max-w-2xl text-sm leading-relaxed text-cream/70 italic sm:mt-3 sm:text-base">
                  “{movie.tagline}”
                </p>
              ) : null}

              <div className="hero-line hero-line-3 mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-cream/80 sm:mt-5 sm:gap-x-4 sm:text-sm">
                {certification ? (
                  <span className="inline-flex min-h-8 items-center rounded border border-cream/25 bg-black/35 px-2 font-semibold tracking-wide text-cream/90 backdrop-blur-sm">
                    {certification}
                  </span>
                ) : null}
                {releaseYear ? (
                  <span className="text-cream/75">{releaseYear}</span>
                ) : null}
                {runtime ? (
                  <span className="inline-flex items-center gap-1.5 text-cream/75">
                    <Clock3 className="size-3.5 text-amber/80" aria-hidden />
                    {runtime}
                  </span>
                ) : null}
                <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-amber/35 bg-black/35 px-2.5 text-amber backdrop-blur-md sm:min-h-9 sm:px-3">
                  <Star
                    className="size-3.5 fill-current sm:size-4"
                    aria-hidden
                  />
                  <strong>{movie.vote_average.toFixed(1)}</strong>
                  <span className="text-amber/65">TMDB</span>
                </span>
              </div>

              {movie.genres.length > 0 ? (
                <div className="hero-line hero-line-4 mt-3 flex flex-wrap gap-2 sm:mt-4">
                  {movie.genres.map((genre) => (
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

              {movie.overview ? (
                <p className="hero-line hero-line-4 mt-4 line-clamp-3 max-w-2xl text-sm leading-relaxed text-cream/72 sm:mt-5 sm:text-base sm:leading-7">
                  {movie.overview}
                </p>
              ) : null}

              <div className="hero-line hero-line-5 mt-5 sm:mt-6">
                <DetailActionRail label={`${movie.title} actions`}>
                  <MovieHeroActions
                    movieId={movie.id}
                    title={movie.title}
                    posterPath={movie.poster_path}
                    trailerKey={trailerKey}
                    watchOffer={watchOffer}
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
                    alt={movie.title}
                    fill
                    sizes="320px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-5 text-center font-display text-3xl text-cream/45">
                    {movie.title}
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
              {movie.overview || "No synopsis is available for this movie yet."}
            </p>
            {director || (writers && writers.length > 0) ? (
              <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-cream/10 pt-5">
                {director ? (
                  <p className="text-sm text-cream/50">
                    Director{" "}
                    <Link
                      href={`/person/${director.id}`}
                      className="ml-2 text-cream/85 transition-colors hover:text-amber"
                    >
                      {director.name}
                    </Link>
                  </p>
                ) : null}
                {writers && writers.length > 0 ? (
                  <p className="text-sm text-cream/50">
                    Written by{" "}
                    <span className="ml-2 text-cream/85">
                      {writers.map((writer, i) => (
                        <span key={`${writer.id}-${writer.job}`}>
                          {i > 0 ? ", " : null}
                          <Link
                            href={`/person/${writer.id}`}
                            className="transition-colors hover:text-amber"
                          >
                            {writer.name}
                          </Link>
                        </span>
                      ))}
                    </span>
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>

          <TitleMedia title={movie.title} clips={clips} stills={stills} />

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
                    movieId={movie.id}
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
                  movieId={movie.id}
                  initialRating={favorite.rating}
                  initialNote={favorite.note}
                  className="mt-5 max-w-xl"
                />
              ) : (
                <div className="mt-5 flex max-w-xl flex-col gap-3 rounded-2xl border border-cream/12 bg-cream/[0.02] px-5 py-5">
                  <p className="text-sm leading-relaxed text-cream/65">
                    Favorite this title to add a rating and personal notes.
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
              title={movie.title}
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
              <Fact label="Status" value={movie.status} />
              <Fact
                label="Released"
                value={formatReleaseDate(movie.release_date)}
              />
              <Fact label="Original title" value={movie.original_title} />
              <Fact label="Language" value={language} />
              <Fact label="Countries" value={countries} />
              <Fact label="Studio" value={companies} />
              <Fact label="Budget" value={formatMoney(movie.budget)} />
              <Fact
                label="Worldwide gross"
                value={formatMoney(movie.revenue)}
              />
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

            {movie.homepage || movie.imdb_id ? (
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 border-t border-cream/10 pt-5">
                {movie.homepage ? (
                  <a
                    href={movie.homepage}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-cream/70 transition-colors hover:text-amber"
                  >
                    Official site{" "}
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                ) : null}
                {movie.imdb_id ? (
                  <a
                    href={`https://www.imdb.com/title/${movie.imdb_id}/`}
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

      {collectionMovies.length > 0 && movie.belongs_to_collection ? (
        <section className="border-t border-cream/10 pt-10 sm:pt-14">
          <MovieRow
            id="collection"
            title={movie.belongs_to_collection.name}
            subtitle={`Part of ${movie.belongs_to_collection.name}`}
            movies={collectionMovies}
          />
        </section>
      ) : null}

      {similar.length > 0 ? (
        <section className="border-t border-cream/10 pt-10 pb-16 sm:pt-14 sm:pb-20">
          <MovieRow
            id="similar"
            title="More like this"
            subtitle="Recommended from this title"
            movies={similar}
          />
        </section>
      ) : null}
    </main>
  );
}
