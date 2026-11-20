import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { MovieCard } from "@/components/movie-card";
import type { MediaKind, TmdbMovie } from "@/lib/tmdb";

type MovieRowProps = {
  id: string;
  title: string;
  subtitle?: string;
  movies: TmdbMovie[];
  /** Optional “See all” link (e.g. /genres/35). */
  href?: string;
  /** Defaults to movie; use `tv` for series rows. */
  mediaType?: MediaKind;
  favoriteIds?: number[];
  /** Mount favorite hearts (signed-in only). */
  showFavorite?: boolean;
  /** Cap posters in the grid (rest via See all). */
  limit?: number;
};

/**
 * Poster shelf as a wrapping grid — no horizontal overflow scroll.
 */
export function MovieRow({
  id,
  title,
  subtitle,
  movies,
  href,
  mediaType = "movie",
  favoriteIds,
  showFavorite = false,
  limit = 12,
}: MovieRowProps) {
  const favoriteSet =
    favoriteIds && favoriteIds.length > 0 ? new Set(favoriteIds) : null;
  const row = limit > 0 ? movies.slice(0, limit) : movies;

  if (row.length === 0) return null;

  return (
    <section
      id={id}
      aria-label={title}
      className="row-reveal scroll-mt-24 space-y-5 sm:space-y-6"
    >
      <div className="flex items-end justify-between gap-3 px-5 sm:gap-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="min-w-0">
          <h2 className="font-display text-2xl tracking-tight text-cream sm:text-3xl md:text-4xl">
            {href ? (
              <Link
                href={href}
                className="group inline-flex max-w-full items-center gap-1.5 text-cream transition-colors duration-200 hover:text-amber"
              >
                <span className="truncate">{title}</span>
                <ChevronRight
                  aria-hidden
                  strokeWidth={2.5}
                  className="size-[0.7em] shrink-0 text-cream/30 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-amber"
                />
              </Link>
            ) : (
              title
            )}
          </h2>
          {subtitle ? (
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-cream/45 sm:text-[15px]">
              {subtitle}
            </p>
          ) : null}
        </div>

        {href ? (
          <Link
            href={href}
            className="mb-0.5 shrink-0 text-sm text-cream/50 transition-colors hover:text-amber sm:mb-1"
          >
            See all
          </Link>
        ) : null}
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-7 px-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 sm:px-8 md:grid-cols-4 lg:grid-cols-5 lg:px-12 xl:grid-cols-6 xl:px-16">
        {row.map((movie) => (
          <li key={movie.id} className="min-w-0">
            <MovieCard
              id={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              voteAverage={movie.vote_average}
              mediaType={mediaType}
              showFavorite={showFavorite}
              initialFavorite={favoriteSet?.has(movie.id) ?? false}
              showTitle
              sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, (max-width: 1280px) 16vw, 14vw"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
