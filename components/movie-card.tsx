"use client";

import { Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useOptimistic, useState } from "react";
import { toggleList, type ToggleListState } from "@/app/actions/favorites";
import { LIST_FAVORITE, type MediaListType } from "@/lib/lists";
import { mediaPath, posterUrl, type MediaKind } from "@/lib/tmdb";
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
  initialFavorite?: boolean;
  /** Show a Film / Series chip (search results). */
  showMediaBadge?: boolean;
};

function FavoriteHeart({
  movieId,
  title,
  posterPath,
  mediaType,
  initialFavorite,
}: {
  movieId: number;
  title: string;
  posterPath: string | null;
  mediaType: MediaListType;
  initialFavorite: boolean;
}) {
  const router = useRouter();
  const [state, dispatch, pending] = useActionState(toggleList, {
    saved: initialFavorite,
    listType: LIST_FAVORITE,
  } satisfies ToggleListState);
  const saved = state.saved ?? initialFavorite;
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);

  useEffect(() => {
    if (state.error?.toLowerCase().includes("sign in")) {
      router.push("/signin");
    }
  }, [state.error, router]);

  function action(formData: FormData) {
    if (pending) return;
    setOptimisticSaved(!optimisticSaved);
    dispatch(formData);
  }

  return (
    <form action={action} onClick={(e) => e.stopPropagation()}>
      <input type="hidden" name="movieId" value={movieId} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="posterPath" value={posterPath ?? ""} />
      <input type="hidden" name="listType" value={LIST_FAVORITE} />
      <input type="hidden" name="mediaType" value={mediaType} />
      <button
        type="submit"
        aria-busy={pending}
        aria-label={
          optimisticSaved ? "Remove from favorites" : "Add to favorites"
        }
        aria-pressed={optimisticSaved}
        className={cn(
          "movie-card-heart inline-flex size-7 items-center justify-center rounded-full border border-cream/10 bg-black/55 text-cream/85 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md will-change-transform",
          "opacity-100 translate-y-0 scale-100 transition-[opacity,transform,color,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "hover:border-red-400/35 hover:bg-black/75 hover:text-red-400 active:scale-95",
          optimisticSaved &&
            "border-red-400/40 text-red-500 shadow-[0_8px_22px_-10px_rgba(239,68,68,0.55)]",
        )}
      >
        <Heart
          className="size-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          fill={optimisticSaved ? "currentColor" : "none"}
          strokeWidth={optimisticSaved ? 2.25 : 2}
          aria-hidden
        />
      </button>
    </form>
  );
}

/**
 * Poster card — image zooms inside the frame (no layout jump), card lifts,
 * soft glow + title fade. Respects prefers-reduced-motion via globals.
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
  initialFavorite = false,
  showMediaBadge = false,
}: MovieCardProps) {
  const src = posterUrl(posterPath);
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;
  const rating =
    voteAverage != null && voteAverage > 0
      ? voteAverage.toFixed(1)
      : null;

  return (
    <div className={cn("movie-card group relative block", className)}>
      <Link href={mediaPath(mediaType, id)} className="block">
        <div className="movie-card-frame relative aspect-2/3 overflow-hidden rounded-xl bg-stage shadow-[0_10px_28px_-14px_rgba(0,0,0,0.7)] ring-1 ring-cream/10 transition-[transform,box-shadow,ring-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:-translate-y-2 group-hover:shadow-[0_28px_50px_-18px_rgba(0,0,0,0.9),0_0_36px_-18px_color-mix(in_srgb,var(--amber)_35%,transparent)] group-hover:ring-amber/30">
          {showImage ? (
            <Image
              src={src!}
              alt={title}
              fill
              sizes={sizes}
              priority={priority}
              onError={() => setFailed(true)}
              className="movie-card-image object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.07]"
            />
          ) : (
            <span className="flex h-full items-center justify-center bg-stage p-3 text-center text-xs leading-snug text-cream/45">
              {title}
            </span>
          )}

          {showMediaBadge ? (
            <span className="pointer-events-none absolute bottom-2 left-2 z-[1] rounded-full border border-cream/15 bg-black/60 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-cream/85 uppercase backdrop-blur-md">
              {mediaType === "tv" ? "Series" : "Film"}
            </span>
          ) : null}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_40%,rgba(0,0,0,0.35)_100%)] opacity-50 transition-opacity duration-300 group-hover:opacity-70"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-black/45 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90"
          />
          <div
            aria-hidden
            className="movie-card-sheen pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          {!showTitle ? (
            <div className="movie-card-caption pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 via-black/55 to-transparent px-2.5 pt-14 pb-2.5 opacity-100 translate-y-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
              <span
                aria-hidden
                className="mb-1.5 block h-0.5 w-6 rounded-full bg-amber/80"
              />
              <p className="line-clamp-2 text-[13px] leading-snug font-medium text-cream">
                {title}
              </p>
            </div>
          ) : null}
        </div>

        {showTitle ? (
          <p className="mt-2.5 line-clamp-2 text-sm text-cream/65 transition-colors duration-300 group-hover:text-cream">
            {title}
          </p>
        ) : null}
      </Link>

      <div className="pointer-events-none absolute inset-x-2 top-2 z-10 flex h-7 items-center justify-between">
        {rating ? (
          <span className="movie-card-rating inline-flex h-6 items-center gap-1 rounded-full border border-amber/20 bg-black/55 px-2 text-[11px] font-medium leading-none text-cream/90 shadow-[0_6px_16px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md transition-[background-color,transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-amber/40 group-hover:bg-black/70 group-hover:shadow-[0_8px_18px_-8px_color-mix(in_srgb,var(--amber)_40%,transparent)]">
            <Star
              className="size-3 fill-amber text-amber transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
              aria-hidden
            />
            {rating}
          </span>
        ) : (
          <span />
        )}
        <div className="pointer-events-auto">
          <FavoriteHeart
            movieId={id}
            title={title}
            posterPath={posterPath}
            mediaType={mediaType}
            initialFavorite={initialFavorite}
          />
        </div>
      </div>
    </div>
  );
}
