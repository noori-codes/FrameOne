"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { mediaPath, posterUrl, type MediaKind } from "@/lib/tmdb";
import { tmdbImageLoader } from "@/lib/tmdb-image-loader";
import { cn } from "@/lib/utils";

type MovieCardProps = {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage?: number;
  /** Show title under the poster (grids). Rows use hover reveal instead. */
  showTitle?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** Defaults to movie; use `tv` for series posters. */
  mediaType?: MediaKind;
};

/**
 * Poster card — image zooms inside the frame (no layout jump), card lifts,
 * soft shadow + title fade. Respects prefers-reduced-motion via globals.
 * Falls back to a title tile when TMDB has no path or the image 404s.
 */
export function MovieCard({
  id,
  title,
  posterPath,
  voteAverage,
  showTitle = false,
  priority = false,
  sizes = "(max-width: 640px) 40vw, 160px",
  className,
  mediaType = "movie",
}: MovieCardProps) {
  const src = posterUrl(posterPath);
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;
  const rating =
    voteAverage != null && voteAverage > 0
      ? voteAverage.toFixed(1)
      : null;

  return (
    <Link
      href={mediaPath(mediaType, id)}
      className={cn("movie-card group block", className)}
    >
      <div className="movie-card-frame relative aspect-2/3 overflow-hidden rounded-lg bg-stage shadow-[0_8px_24px_-12px_rgba(0,0,0,0.65)] ring-1 ring-cream/10 transition-[transform,box-shadow,ring-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.85)] group-hover:ring-cream/20">
        {showImage ? (
          <Image
            src={src!}
            alt={title}
            fill
            sizes={sizes}
            priority={priority}
            // TMDB size CDN via custom loader — skips Next optimizer timeouts
            loader={tmdbImageLoader}
            onError={() => setFailed(true)}
            className="movie-card-image object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.06]"
          />
        ) : (
          <span className="flex h-full items-center justify-center bg-stage p-3 text-center text-xs leading-snug text-cream/45">
            {title}
          </span>
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-linear-to-b from-black/40 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-85"
        />

        {!showTitle ? (
          <div className="movie-card-caption pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/45 to-transparent px-2.5 pt-12 pb-2.5 opacity-0 translate-y-1.5 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 group-hover:translate-y-0">
            <p className="line-clamp-2 text-[13px] leading-snug font-medium text-cream">
              {title}
            </p>
          </div>
        ) : null}

        {rating ? (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-cream/90 backdrop-blur-sm transition-colors duration-300 group-hover:bg-black/70">
            <Star className="h-3 w-3 fill-amber text-amber" aria-hidden />
            {rating}
          </span>
        ) : null}
      </div>

      {showTitle ? (
        <p className="mt-2.5 line-clamp-2 text-sm text-cream/65 transition-colors duration-300 group-hover:text-cream">
          {title}
        </p>
      ) : null}
    </Link>
  );
}
