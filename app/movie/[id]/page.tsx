import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { SaveListButtons } from "@/components/save-list-buttons";
import { FavoriteMetaForm } from "@/components/favorite-meta-form";
import { prisma } from "@/lib/prisma";
import { TrailerButton } from "@/components/trailer-button";
import { backdropUrl, getMovie, getMovieTrailerKey, posterUrl } from "@/lib/tmdb";

/**
 * Dynamic route: folder name `[id]` → URL `/movie/550`
 * In Next.js App Router, `params` is a Promise — await it first.
 */
type MoviePageProps = {
  params: Promise<{ id: string }>;
};

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
  const [favorite, watchlistItem] = userId
    ? await Promise.all([
        prisma.favorite.findUnique({
          where: {
            userId_movieId_listType: {
              userId,
              movieId: movie.id,
              listType: "favorite",
            },
          },
        }),
        prisma.favorite.findUnique({
          where: {
            userId_movieId_listType: {
              userId,
              movieId: movie.id,
              listType: "watchlist",
            },
          },
        }),
      ])
    : [null, null];

  const trailerKey = await getMovieTrailerKey(movie.id);
  const poster = posterUrl(movie.poster_path, "w500");
  const backdrop = backdropUrl(movie.backdrop_path);
  const year = movie.release_date?.slice(0, 4);
  const runtime =
    movie.runtime != null
      ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
      : null;

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            sizes="100vw"
            // Bypass /_next/image — TMDB CDN can exceed Next’s 7s upstream timeout
            unoptimized
            className="object-cover opacity-40"
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-background/35" />
        <div className="film-grain absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 pt-10 pb-20 sm:flex-row sm:items-end sm:px-8 sm:pb-24">
        <div className="relative mx-auto aspect-2/3 w-48 shrink-0 overflow-hidden rounded-lg bg-stage shadow-[0_16px_48px_-16px_rgba(0,0,0,0.8)] ring-1 ring-cream/15 sm:mx-0 sm:w-56">
          {poster ? (
            <Image
              src={poster}
              alt={movie.title}
              fill
              sizes="224px"
              className="object-cover"
              priority
              // Bypass /_next/image — TMDB CDN can exceed Next’s 7s upstream timeout
              unoptimized
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href="/#trending"
            className="text-sm text-cream/50 transition-colors hover:text-amber"
          >
            ← Back to browse
          </Link>

          <h1 className="mt-4 font-display text-5xl tracking-wide text-cream uppercase sm:text-7xl">
            {movie.title}
          </h1>

          {movie.tagline ? (
            <p className="mt-2 text-base text-amber/80 italic">{movie.tagline}</p>
          ) : null}

          <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-cream/55 sm:text-base">
            {year ? <span>{year}</span> : null}
            {runtime ? <span>{runtime}</span> : null}
            <span className="text-amber">★ {movie.vote_average.toFixed(1)}</span>
            {favorite?.rating != null ? (
              <span className="text-cream/70">Your ★ {favorite.rating}/10</span>
            ) : null}
          </p>

          {movie.genres.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {movie.genres.map((g) => (
                <Link
                  key={g.id}
                  href={`/genres/${g.id}`}
                  className="rounded-full border border-cream/15 px-3 py-1 text-xs text-cream/65 transition-colors hover:border-amber hover:text-amber"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          ) : null}

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream/70">
            {movie.overview || "No overview available."}
          </p>

          {favorite?.note ? (
            <p className="mt-4 max-w-md rounded-xl border border-cream/10 bg-black/25 px-4 py-3 text-sm text-cream/65 italic">
              “{favorite.note}”
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
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
              className="mt-6"
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
