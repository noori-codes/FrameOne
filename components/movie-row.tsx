import Image from "next/image";
import Link from "next/link";
import type { TmdbMovie } from "@/lib/tmdb";
import { posterUrl } from "@/lib/tmdb";

type MovieRowProps = {
  id: string;
  title: string;
  subtitle?: string;
  movies: TmdbMovie[];
};

/** Horizontal poster strip — reused for Popular / Trending / Top rated. */
export function MovieRow({ id, title, subtitle, movies }: MovieRowProps) {
  const row = movies.slice(0, 12);

  return (
    <section id={id} aria-label={title}>
      <p className="text-xs tracking-[0.25em] text-cream/40 uppercase">
        {title}
      </p>
      {subtitle ? (
        <p className="mt-2 text-sm text-cream/55">{subtitle}</p>
      ) : null}

      <ul className="mt-6 flex gap-3 overflow-x-auto pb-2">
        {row.map((movie) => {
          const src = posterUrl(movie.poster_path);
          return (
            <li key={movie.id} className="shrink-0">
              <Link
                href={`/movie/${movie.id}`}
                className="relative block h-44 w-28 overflow-hidden rounded-sm bg-stage ring-1 ring-cream/10 transition-[box-shadow,transform] hover:scale-[1.03] hover:ring-amber/50"
              >
                {src ? (
                  <Image
                    src={src}
                    alt={movie.title}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center p-2 text-center text-xs text-cream/40">
                    {movie.title}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
