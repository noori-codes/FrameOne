import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Film,
  Globe2,
  Languages,
  Star,
  TrendingUp,
  Users,
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

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="min-w-0 border-b border-cream/8 py-3 last:border-b-0">
      <dt className="text-xs tracking-wide text-cream/40 uppercase">{label}</dt>
      <dd className="mt-1 break-words text-sm leading-relaxed text-cream/80">
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
  const runtime = formatRuntime(movie.runtime);
  const releaseDate = formatReleaseDate(movie.release_date);
  const audienceScore = Math.min(Math.max(movie.vote_average * 10, 0), 100);
  const director = movie.credits?.crew.find((person) => person.job === "Director");
  const writers = movie.credits?.crew
    .filter((person) =>
      ["Writer", "Screenplay", "Story"].includes(person.job),
    )
    .slice(0, 4);
  const cast = movie.credits?.cast.slice(0, 10) ?? [];
  const details = [
    { label: "Release date", value: releaseDate },
    { label: "Status", value: movie.status },
    { label: "Original title", value: movie.original_title },
    {
      label: "Original language",
      value: movie.spoken_languages?.find(
        (language) => language.iso_639_1 === movie.original_language,
      )?.english_name ?? movie.original_language?.toUpperCase(),
    },
    {
      label: "Spoken languages",
      value: movie.spoken_languages
        ?.map((language) => language.english_name || language.name)
        .filter(Boolean)
        .join(", "),
    },
    {
      label: "Production countries",
      value: movie.production_countries?.map((country) => country.name).join(", "),
    },
    {
      label: "Production companies",
      value: movie.production_companies?.map((company) => company.name).join(", "),
    },
  ];

  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <section className="relative isolate overflow-hidden border-b border-cream/8">
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            sizes="100vw"
            unoptimized
            className="pointer-events-none object-cover object-center opacity-35"
          />
        ) : null}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-r from-background via-background/90 to-background/60"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-background via-transparent to-background/30"
        />
        <div className="film-grain pointer-events-none absolute inset-0" />

        <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center sm:gap-10 sm:px-8 sm:py-14 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14 lg:py-20">
          <div className="relative mx-auto aspect-2/3 w-40 shrink-0 overflow-hidden rounded-xl bg-stage shadow-[0_24px_70px_-20px_rgba(0,0,0,0.9)] ring-1 ring-cream/20 sm:mx-0 sm:w-full">
            {poster ? (
              <Image
                src={poster}
                alt={movie.title}
                fill
                sizes="(max-width: 640px) 160px, 260px"
                className="object-cover"
                priority
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center p-5 text-center font-display text-xl text-cream/40">
                {movie.title}
              </div>
            )}
          </div>

          <div className="min-w-0 text-center sm:text-left">
            <Link
              href="/#trending"
              className="text-sm text-cream/55 transition-colors hover:text-amber"
            >
              ← Back to browse
            </Link>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-medium tracking-[0.18em] text-amber uppercase sm:justify-start">
              <span>Movie</span>
              {movie.status ? (
                <>
                  <span aria-hidden className="text-cream/30">·</span>
                  <span className="text-cream/55">{movie.status}</span>
                </>
              ) : null}
            </div>
            <h1 className="mt-2 font-display text-4xl leading-[0.98] tracking-wide wrap-break-word text-cream uppercase sm:text-6xl md:text-7xl">
              {movie.title}
            </h1>
            {movie.tagline ? (
              <p className="mt-4 text-base text-amber/85 italic sm:text-lg">
                “{movie.tagline}”
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-cream/65 sm:justify-start">
              {releaseDate ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-amber/80" aria-hidden />
                  {releaseDate}
                </span>
              ) : null}
              {runtime ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-4 text-amber/80" aria-hidden />
                  {runtime}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 text-amber">
                <Star className="size-4 fill-current" aria-hidden />
                {movie.vote_average.toFixed(1)}
                {movie.vote_count != null ? (
                  <span className="text-cream/45">
                    ({movie.vote_count.toLocaleString()} ratings)
                  </span>
                ) : null}
              </span>
            </div>

            {movie.genres.length > 0 ? (
              <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                {movie.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/genres/${genre.id}`}
                    className="rounded-full border border-cream/20 bg-black/20 px-3 py-1.5 text-xs text-cream/75 transition-colors hover:border-amber/60 hover:text-amber"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <TrailerButton
                youtubeKey={trailerKey}
                title={movie.title}
                label="Watch trailer"
              />
            </div>
            <SaveListButtons
              key={`${movie.id}-${Boolean(favorite)}-${Boolean(watchlistItem)}`}
              movieId={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              initialFavorite={Boolean(favorite)}
              initialWatchlist={Boolean(watchlistItem)}
              signedIn={Boolean(session?.user)}
            />

            {favorite ? (
              <FavoriteMetaForm
                key={`${favorite.id}-${favorite.rating}-${favorite.note}`}
                movieId={movie.id}
                initialRating={favorite.rating}
                initialNote={favorite.note}
                className="mt-6 text-left"
              />
            ) : null}
            {favorite?.note ? (
              <p className="mx-auto mt-4 max-w-md rounded-xl border border-cream/10 bg-black/25 px-4 py-3 text-left text-sm text-cream/65 italic sm:mx-0">
                “{favorite.note}”
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-8 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-cream/10 bg-stage/65 p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-amber/10 p-2.5 text-amber">
                <Film className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs tracking-[0.18em] text-amber uppercase">
                  The story
                </p>
                <h2 className="mt-1 text-xl font-semibold text-cream sm:text-2xl">
                  Synopsis
                </h2>
              </div>
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-cream/75 sm:text-base sm:leading-8">
              {movie.overview || "No synopsis is available for this movie yet."}
            </p>
            {director ? (
              <p className="mt-5 border-t border-cream/8 pt-4 text-sm text-cream/55">
                Directed by <span className="font-medium text-cream/85">{director.name}</span>
                {writers && writers.length > 0 ? (
                  <>
                    <span className="mx-2 text-cream/25">·</span>
                    Written by{" "}
                    <span className="font-medium text-cream/85">
                      {writers.map((writer) => writer.name).join(", ")}
                    </span>
                  </>
                ) : null}
              </p>
            ) : null}
          </section>

          {cast.length > 0 ? (
            <section className="rounded-2xl border border-cream/10 bg-stage/65 p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-amber/10 p-2.5 text-amber">
                  <Users className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs tracking-[0.18em] text-amber uppercase">
                    On screen
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-cream sm:text-2xl">
                    Cast
                  </h2>
                </div>
              </div>
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {cast.map((person) => {
                  const profile = profileUrl(person.profile_path);
                  return (
                    <li
                      key={`${person.id}-${person.character}`}
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-cream/8 bg-background/40 p-2.5"
                    >
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-cream/10">
                        {profile ? (
                          <Image
                            src={profile}
                            alt=""
                            fill
                            sizes="44px"
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-sm font-semibold text-cream/45">
                            {person.name.slice(0, 1)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-cream/90">
                          {person.name}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-cream/45">
                          {person.character || "Cast"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <section className="rounded-2xl border border-cream/10 bg-stage/65 p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-amber/10 p-2.5 text-amber">
                <Building2 className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs tracking-[0.18em] text-amber uppercase">
                  Behind the scenes
                </p>
                <h2 className="mt-1 text-xl font-semibold text-cream sm:text-2xl">
                  Movie details
                </h2>
              </div>
            </div>
            <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
              {details.map((item) => (
                <DetailItem key={item.label} {...item} />
              ))}
            </dl>
            {movie.homepage || movie.imdb_id ? (
              <div className="mt-4 flex flex-wrap gap-3 border-t border-cream/8 pt-4">
                {movie.homepage ? (
                  <a
                    href={movie.homepage}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-amber transition-colors hover:text-cream"
                  >
                    Official website
                    <ArrowUpRight className="size-4" aria-hidden />
                  </a>
                ) : null}
                {movie.imdb_id ? (
                  <a
                    href={`https://www.imdb.com/title/${movie.imdb_id}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-amber transition-colors hover:text-cream"
                  >
                    IMDb
                    <ArrowUpRight className="size-4" aria-hidden />
                  </a>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>

        <aside className="space-y-6">
          <section
            aria-label="Audience rating"
            className="rounded-2xl border border-cream/10 bg-stage/65 p-5 sm:p-6"
          >
            <p className="text-xs tracking-[0.18em] text-amber uppercase">
              Audience rating
            </p>
            <div className="mt-4 flex items-end gap-2">
              <Star className="mb-1 size-6 fill-amber text-amber" aria-hidden />
              <span className="font-display text-5xl text-cream">
                {movie.vote_average.toFixed(1)}
              </span>
              <span className="mb-1 text-sm text-cream/45">/ 10</span>
            </div>
            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-cream/10"
              role="meter"
              aria-label="Audience score"
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={movie.vote_average}
            >
              <div
                className="h-full rounded-full bg-amber"
                style={{ width: `${audienceScore}%` }}
              />
            </div>
            {movie.vote_count != null ? (
              <p className="mt-2 text-xs text-cream/45">
                Based on {movie.vote_count.toLocaleString()} ratings
              </p>
            ) : null}
            {favorite?.rating != null ? (
              <p className="mt-4 border-t border-cream/8 pt-4 text-sm text-cream/65">
                Your rating <span className="float-right font-medium text-amber">{favorite.rating}/10</span>
              </p>
            ) : null}
          </section>

          {movie.budget || movie.revenue ? (
            <section className="rounded-2xl border border-cream/10 bg-stage/65 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-amber/10 p-2.5 text-amber">
                  <CircleDollarSign className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs tracking-[0.18em] text-amber uppercase">
                    The numbers
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-cream">
                    Box office
                  </h2>
                </div>
              </div>
              <dl className="mt-4 divide-y divide-cream/8">
                {formatMoney(movie.budget) ? (
                  <div className="flex items-center justify-between gap-3 py-3">
                    <dt className="text-sm text-cream/50">Budget</dt>
                    <dd className="text-sm font-medium text-cream">
                      {formatMoney(movie.budget)}
                    </dd>
                  </div>
                ) : null}
                {formatMoney(movie.revenue) ? (
                  <div className="flex items-center justify-between gap-3 py-3">
                    <dt className="text-sm text-cream/50">Worldwide gross</dt>
                    <dd className="text-sm font-medium text-cream">
                      {formatMoney(movie.revenue)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}

          <section className="rounded-2xl border border-cream/10 bg-stage/65 p-5 sm:p-6">
            <p className="text-xs tracking-[0.18em] text-amber uppercase">
              At a glance
            </p>
            <dl className="mt-3 divide-y divide-cream/8">
              {runtime ? (
                <div className="flex items-center gap-3 py-3">
                  <Clock3 className="size-4 shrink-0 text-amber/80" aria-hidden />
                  <dt className="text-sm text-cream/50">Runtime</dt>
                  <dd className="ml-auto text-right text-sm text-cream/85">{runtime}</dd>
                </div>
              ) : null}
              {movie.original_language ? (
                <div className="flex items-center gap-3 py-3">
                  <Languages className="size-4 shrink-0 text-amber/80" aria-hidden />
                  <dt className="text-sm text-cream/50">Language</dt>
                  <dd className="ml-auto text-right text-sm uppercase text-cream/85">
                    {movie.original_language}
                  </dd>
                </div>
              ) : null}
              {movie.popularity != null ? (
                <div className="flex items-center gap-3 py-3">
                  <TrendingUp className="size-4 shrink-0 text-amber/80" aria-hidden />
                  <dt className="text-sm text-cream/50">Popularity</dt>
                  <dd className="ml-auto text-right text-sm text-cream/85">
                    {movie.popularity.toLocaleString(undefined, {
                      maximumFractionDigits: 1,
                    })}
                  </dd>
                </div>
              ) : null}
              {movie.production_countries?.length ? (
                <div className="flex items-start gap-3 py-3">
                  <Globe2 className="mt-0.5 size-4 shrink-0 text-amber/80" aria-hidden />
                  <dt className="text-sm text-cream/50">Origin</dt>
                  <dd className="ml-auto max-w-[60%] text-right text-sm text-cream/85">
                    {movie.production_countries.map((country) => country.name).join(", ")}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="border-t border-cream/8 bg-background pt-10 pb-16 sm:pt-14 sm:pb-20">
          <MovieRow
            id="similar"
            title="More like this"
            subtitle={`Titles related to ${movie.title}`}
            movies={similar}
          />
        </section>
      ) : null}
    </main>
  );
}
