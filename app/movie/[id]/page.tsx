import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Star,
} from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { FavoriteMetaForm } from "@/components/favorite-meta-form";
import { MovieRow } from "@/components/movie-row";
import { SaveListButtons } from "@/components/save-list-buttons";
import { TrailerButton } from "@/components/trailer-button";
import { prisma } from "@/lib/prisma";
import {
  backdropUrl,
  getMovie,
  getMovieTrailerKey,
  getSimilarMovies,
  posterUrl,
  profileUrl,
} from "@/lib/tmdb";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

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
  const movie = await getMovie(id);
  if (!movie) notFound();

  const session = await auth();
  const userId = session?.user?.id;

  const [favorite, watchlistItem, trailerKey, similar] = await Promise.all([
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
    getMovieTrailerKey(movie.id),
    getSimilarMovies(movie.id, 20),
  ]);

  const poster = posterUrl(movie.poster_path, "w500");
  const backdrop = backdropUrl(movie.backdrop_path);
  const releaseDate = formatReleaseDate(movie.release_date);
  const runtime = formatRuntime(movie.runtime);
  const director = movie.credits?.crew.find(
    (person) => person.job === "Director",
  );
  const writers = movie.credits?.crew
    .filter((person) => ["Writer", "Screenplay", "Story"].includes(person.job))
    .slice(0, 3);
  const cast = movie.credits?.cast.slice(0, 10) ?? [];
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
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,10,11,0.96)_0%,rgba(7,10,11,0.72)_48%,rgba(7,10,11,0.24)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#070a0b_0%,rgba(7,10,11,0.48)_28%,transparent_72%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,11,0.42)_0%,transparent_22%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_82%_30%,color-mix(in_srgb,var(--amber)_14%,transparent),transparent_48%)]"
        />
        <div aria-hidden className="film-grain absolute inset-0 opacity-70" />

        <div className="relative mx-auto flex w-full max-w-screen-2xl flex-1 flex-col px-4 pb-6 pt-16 sm:px-6 sm:pb-10 sm:pt-20 lg:px-8 lg:pb-12 lg:pt-24">
          <Link
            href="/#trending"
            className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-cream/15 bg-black/25 px-3.5 text-xs font-medium text-cream/75 backdrop-blur-md transition-[border-color,color,background-color] hover:border-amber/40 hover:bg-black/40 hover:text-amber sm:text-sm"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to browse
          </Link>

          <div className="mt-auto grid grid-cols-1 items-end gap-7 pt-8 sm:gap-10 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:pt-16">
            <div className="min-w-0 lg:pb-2">
              <div className="relative mx-auto mb-6 w-full max-w-[140px] sm:mb-8 sm:max-w-[160px] lg:hidden">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--amber)_22%,transparent),transparent_68%)] blur-2xl"
                />
                <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-stage shadow-[0_28px_70px_-28px_rgba(0,0,0,0.95)] ring-1 ring-cream/20">
                  {poster ? (
                    <Image
                      src={poster}
                      alt={movie.title}
                      fill
                      sizes="160px"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-4 text-center font-display text-2xl text-cream/45">
                      {movie.title}
                    </div>
                  )}
                </div>
              </div>
              <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] text-amber uppercase sm:text-xs">
                <span className="h-px w-5 bg-amber/70" aria-hidden />
                FrameOne <span className="px-1 text-cream/35">/</span> Film
                {movie.release_date
                  ? ` · ${movie.release_date.slice(0, 4)}`
                  : ""}
              </p>
              <h1 className="max-w-4xl font-display text-4xl leading-[0.9] text-balance wrap-break-word text-cream uppercase drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)] sm:text-6xl md:text-7xl lg:text-8xl">
                {movie.title}
              </h1>
              {movie.tagline ? (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream/75 italic sm:mt-4 sm:text-lg">
                  “{movie.tagline}”
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-cream/80 sm:mt-5 sm:gap-x-5 sm:gap-y-3 sm:text-sm">
                {releaseDate ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-cream/12 bg-black/25 px-2.5 py-1 backdrop-blur-sm">
                    <CalendarDays
                      className="size-3.5 text-amber sm:size-4"
                      aria-hidden
                    />
                    {releaseDate}
                  </span>
                ) : null}
                {runtime ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-cream/12 bg-black/25 px-2.5 py-1 backdrop-blur-sm">
                    <Clock3
                      className="size-3.5 text-amber sm:size-4"
                      aria-hidden
                    />
                    {runtime}
                  </span>
                ) : null}
                <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-amber/35 bg-black/35 px-2.5 text-amber shadow-[0_10px_28px_-16px_color-mix(in_srgb,var(--amber)_45%,transparent)] backdrop-blur-md sm:min-h-9 sm:px-3">
                  <Star
                    className="size-3.5 fill-current sm:size-4"
                    aria-hidden
                  />
                  <strong>{movie.vote_average.toFixed(1)}</strong>
                  <span className="text-amber/65">/ 10</span>
                </span>
                {movie.vote_count != null ? (
                  <span className="text-xs text-cream/55 sm:text-sm">
                    {movie.vote_count.toLocaleString()} ratings
                  </span>
                ) : null}
              </div>

              {movie.genres.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
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

              <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-6 sm:gap-3">
                {trailerKey ? (
                  <TrailerButton
                    youtubeKey={trailerKey}
                    title={movie.title}
                    label="Watch trailer"
                    className="min-h-10 px-5 text-sm sm:min-h-12 sm:px-6"
                  />
                ) : null}
                <SaveListButtons
                  key={`${movie.id}-${Boolean(favorite)}-${Boolean(watchlistItem)}`}
                  movieId={movie.id}
                  title={movie.title}
                  posterPath={movie.poster_path}
                  initialFavorite={Boolean(favorite)}
                  initialWatchlist={Boolean(watchlistItem)}
                  signedIn={Boolean(session?.user)}
                />
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
                    sizes="300px"
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

      <div className="mx-auto grid w-full max-w-screen-2xl gap-10 border-t border-cream/10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 lg:px-8 lg:py-16">
        <div className="min-w-0 space-y-14 sm:space-y-20">
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
            {director ? (
              <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-cream/10 pt-5">
                <p className="text-sm text-cream/50">
                  Director{" "}
                  <Link
                    href={`/person/${director.id}`}
                    className="ml-2 text-cream/85 transition-colors hover:text-amber"
                  >
                    {director.name}
                  </Link>
                </p>
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
                        <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-stage shadow-[0_16px_36px_-20px_rgba(0,0,0,0.8)] ring-1 ring-cream/10 transition-[ring-color,transform,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:ring-amber/30 group-hover:shadow-[0_22px_44px_-18px_rgba(0,0,0,0.9),0_0_28px_-16px_color-mix(in_srgb,var(--amber)_30%,transparent)]">
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
            </section>
          ) : null}

          {favorite ? (
            <section
              aria-labelledby="your-notes-heading"
              className="border-t border-cream/10 pt-8 sm:pt-10"
            >
              <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase sm:text-xs">
                Your collection
              </p>
              <h2
                id="your-notes-heading"
                className="mt-2 font-display text-4xl text-cream uppercase sm:text-5xl"
              >
                Your notes
              </h2>
              <FavoriteMetaForm
                key={`${favorite.id}-${favorite.rating}-${favorite.note}`}
                movieId={movie.id}
                initialRating={favorite.rating}
                initialNote={favorite.note}
                className="mt-5 max-w-xl"
              />
            </section>
          ) : null}
        </div>

        <aside className="h-fit border-t border-cream/10 pt-7 lg:sticky lg:top-24 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
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

      {similar.length > 0 ? (
        <section className="border-t border-cream/10 pt-10 pb-16 sm:pt-14 sm:pb-20">
          <MovieRow
            id="similar"
            title="More like this"
            subtitle={`Because you watched ${movie.title}`}
            movies={similar}
          />
        </section>
      ) : null}
    </main>
  );
}
