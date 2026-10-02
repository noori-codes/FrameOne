import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { posterUrl } from "@/lib/tmdb";

type MovieCardProps = {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage?: number;
  /** Show title under the poster (grids). Carousel rows usually hide it. */
  showTitle?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/**
 * Shared poster card — 2:3 portrait, 8px radius, amber rating pill, hover scale.
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
}: MovieCardProps) {
  const src = posterUrl(posterPath);
  const rating =
    voteAverage != null && voteAverage > 0
      ? voteAverage.toFixed(1)
      : null;

  return (
    <Link href={`/movie/${id}`} className={cn("group block", className)}>
      <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-stage shadow-[0_12px_40px_-12px_rgba(0,0,0,0.75)] ring-1 ring-cream/10 transition-[transform,box-shadow,ring-color] duration-300 group-hover:scale-[1.04] group-hover:ring-amber/45">
        {src ? (
          <Image
            src={src}
            alt={title}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center p-3 text-center text-xs text-cream/40">
            {title}
          </span>
        )}

        {rating ? (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-medium text-cream backdrop-blur-sm">
            <Star className="h-3 w-3 fill-amber text-amber" aria-hidden />
            {rating}
          </span>
        ) : null}
      </div>

      {showTitle ? (
        <p className="mt-2.5 line-clamp-2 text-sm text-cream/70 transition-colors group-hover:text-cream">
          {title}
        </p>
      ) : null}
    </Link>
  );
}
