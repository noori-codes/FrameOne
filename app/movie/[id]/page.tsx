import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { FavoriteButton } from "@/components/favorite-button";
import { prisma } from "@/lib/prisma";
import { backdropUrl, getMovie, posterUrl } from "@/lib/tmdb";

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
  const favorited = session?.user?.id
    ? Boolean(
        await prisma.favorite.findUnique({
          where: {
            userId_movieId: {
              userId: session.user.id,
              movieId: movie.id,
            },
          },
        }),
      )
    : false;

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
            className="object-cover opacity-35"
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/85 to-background/40" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 pt-24 pb-16 sm:flex-row sm:items-end sm:pb-24">
        <div className="relative mx-auto aspect-2/3 w-48 shrink-0 overflow-hidden rounded-sm bg-stage ring-1 ring-cream/15 sm:mx-0 sm:w-56">
          {poster ? (
            <Image
              src={poster}
              alt={movie.title}
              fill
              sizes="224px"
              className="object-cover"
              priority
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href="/#popular"
            className="text-sm text-cream/50 transition-colors hover:text-amber"
          >
            ← Back to popular
          </Link>

          <h1 className="mt-3 font-display text-4xl tracking-wide text-cream sm:text-6xl">
            {movie.title}
          </h1>

          {movie.tagline ? (
            <p className="mt-2 text-base text-amber/80 italic">{movie.tagline}</p>
          ) : null}

          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-cream/55">
            {year ? <span>{year}</span> : null}
            {runtime ? <span>{runtime}</span> : null}
            <span>{movie.vote_average.toFixed(1)} / 10</span>
          </p>

          {movie.genres.length > 0 ? (
            <p className="mt-2 text-sm text-cream/45">
              {movie.genres.map((g) => g.name).join(" · ")}
            </p>
          ) : null}

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream/70">
            {movie.overview || "No overview available."}
          </p>

          <FavoriteButton
            key={`${movie.id}-${favorited}`}
            movieId={movie.id}
            title={movie.title}
            posterPath={movie.poster_path}
            initialFavorited={favorited}
            signedIn={Boolean(session?.user)}
          />
        </div>
      </div>
    </main>
  );
}
