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
import { tmdbImageLoader } from "@/lib/tmdb-image-loader";

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
            userId_movieId_listType: {
              userId,
              movieId: movie.id,
              listType: "favorite",
            },
          },
        })
      : Promise.resolve(null),
    userId
      ? prisma.favorite.findUnique({
          where: {
            userId_movieId_listType: {
              userId,
              movieId: movie.id,
              listType: "watchlist",
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
            loader={tmdbImageLoader}
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

        <div className="relative mx-auto flex w-full max-w-screen-2xl flex-1 flex-col px-4 pb-6 pt-16 sm:px-6 sm:pb-10 sm:pt-20 lg:px-8 lg:pb-12 lg:pt-24">
          <Link
            href="/#trending"
            className="inline-flex min-h-10 w-fit items-center gap-2 border-b border-cream/25 pb-2 text-xs font-medium text-cream/75 transition-colors hover:border-amber hover:text-amber sm:text-sm"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to browse
          </Link>

          <div className="mt-auto grid grid-cols-1 items-end gap-7 pt-8 sm:gap-10 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:pt-16">
            <div className="min-w-0 lg:pb-2">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-amber uppercase sm:text-xs">
                FrameOne <span className="px-1 text-cream/35">/</span> Film
                {movie.release_date
                  ? ` · ${movie.release_date.slice(0, 4)}`
                  : ""}
              </p>
              <h1 className="max-w-4xl font-display text-4xl leading-[0.9] text-balance wrap-break-word text-cream uppercase sm:text-6xl md:text-7xl lg:text-8xl">
                {movie.title}
              </h1>
              {movie.tagline ? (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream/75 italic sm:mt-4 sm:text-lg">
                  “{movie.tagline}”
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-cream/80 sm:mt-5 sm:gap-x-5 sm:gap-y-3 sm:text-sm">
                {releaseDate ? (
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays
                      className="size-3.5 text-amber sm:size-4"
                      aria-hidden
                    />
                    {releaseDate}
                  </span>
                ) : null}
                {runtime ? (
                  <span className="inline-flex items-center gap-2">
                    <Clock3
                      className="size-3.5 text-amber sm:size-4"
                      aria-hidden
                    />
                    {runtime}
                  </span>
                ) : null}
                <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-amber/35 bg-background/55 px-2.5 text-amber backdrop-blur-sm sm:min-h-9 sm:px-3">
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
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 sm:mt-4 sm:gap-2">
                  {movie.genres.map((genre) => (
                    <Link
                      key={genre.id}
                      href={`/genres/${genre.id}`}
                      className="inline-flex min-h-8 items-center border-b border-cream/25 px-1 text-xs text-cream/75 transition-colors hover:border-amber hover:text-amber sm:min-h-9 sm:px-1.5 sm:text-sm"
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

            <div className="relative hidden aspect-2/3 w-full overflow-hidden rounded-sm bg-stage shadow-[0_32px_90px_-24px_rgba(0,0,0,0.95)] ring-1 ring-white/25 lg:block">
              {poster ? (
                <Image
                  src={poster}
                  alt={movie.title}
                  fill
                  sizes="300px"
                  className="object-cover"
                  priority
                  loader={tmdbImageLoader}
                />
              ) : (
                <div className="flex h-full items-center justify-center p-5 text-center font-display text-3xl text-cream/45">
                  {movie.title}
                </div>
              )}
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
                  <span className="ml-2 text-cream/85">{director.name}</span>
                </p>
                {writers && writers.length > 0 ? (
                  <p className="text-sm text-cream/50">
                    Written by{" "}
                    <span className="ml-2 text-cream/85">
                      {writers.map((writer) => writer.name).join(", ")}
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
                      <div className="relative aspect-4/5 overflow-hidden rounded-sm bg-stage">
                        {profile ? (
                          <Image
                            src={profile}
                            alt={person.name}
                            fill
                            sizes="(max-width: 640px) 42vw, (max-width: 1024px) 25vw, 180px"
                            loader={tmdbImageLoader}
                            className="object-cover transition-transform duration-500 hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center font-display text-4xl text-cream/30">
                            {person.name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <p className="mt-2.5 truncate text-sm font-medium text-cream/90">
                        {person.name}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-cream/45">
                        {person.character || "Cast"}
                      </p>
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
