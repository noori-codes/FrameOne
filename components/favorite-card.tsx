"use client";

import { Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { toggleList, type ToggleListState } from "@/app/actions/favorites";
import { FavoriteMetaForm } from "@/components/favorite-meta-form";
import {
  LIST_FAVORITE,
  MEDIA_MOVIE,
  mediaHref,
  type MediaListType,
} from "@/lib/lists";
import { posterUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

export type FavoriteCardData = {
  id: string;
  movieId: number;
  title: string;
  posterPath: string | null;
  rating: number | null;
  note: string | null;
  mediaType?: MediaListType;
};

type FavoriteCardProps = {
  favorite: FavoriteCardData;
  priority?: boolean;
};

const removeInitial: ToggleListState = {};

/**
 * Favorites shelf card — poster-first with rating, note, and rate/remove.
 */
export function FavoriteCard({ favorite, priority = false }: FavoriteCardProps) {
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const [, removeAction, removing] = useActionState(toggleList, removeInitial);
  const poster = posterUrl(favorite.posterPath, "w500");
  const mediaType = favorite.mediaType ?? MEDIA_MOVIE;
  const href = mediaHref(mediaType, favorite.movieId);

  const closeEditor = useCallback(() => setEditing(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!editing) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeEditor();
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [editing, closeEditor]);

  const modal =
    editing && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeEditor();
            }}
          >
            <div className="w-full max-w-lg rounded-2xl border border-cream/10 bg-stage p-5 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)] sm:p-6">
              <div className="mb-5 flex items-start gap-4">
                <div className="relative aspect-2/3 w-16 shrink-0 overflow-hidden rounded-md bg-background ring-1 ring-cream/10 sm:w-20">
                  {poster ? (
                    <Image
                      src={poster}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-xs tracking-wide text-cream/40 uppercase">
                    Rate & note
                  </p>
                  <h2
                    id={titleId}
                    className="mt-1 text-lg font-semibold leading-snug tracking-tight text-cream"
                  >
                    {favorite.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeEditor}
                  aria-label="Close"
                  className="rounded-full border border-cream/20 p-1.5 text-cream/60 transition-colors hover:border-cream/40 hover:text-cream"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <FavoriteMetaForm
                key={`${favorite.id}-${favorite.rating}-${favorite.note}`}
                movieId={favorite.movieId}
                mediaType={mediaType}
                initialRating={favorite.rating}
                initialNote={favorite.note}
                onSuccess={closeEditor}
              />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <li className="group flex flex-col">
      <div className="relative">
        <Link href={href} className="block">
          <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-stage shadow-[0_10px_28px_-14px_rgba(0,0,0,0.7)] ring-1 ring-cream/10 transition-[transform,box-shadow,ring-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:-translate-y-1.5 group-hover:shadow-[0_28px_50px_-18px_rgba(0,0,0,0.9),0_0_36px_-18px_color-mix(in_srgb,var(--amber)_35%,transparent)] group-hover:ring-amber/30">
            {poster ? (
              <Image
                src={poster}
                alt={favorite.title}
                fill
                priority={priority}
                sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, (max-width: 1280px) 16vw, 12vw"
                className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-[1.045]"
              />
            ) : (
              <span className="flex h-full items-center justify-center bg-stage p-3 text-center text-xs leading-snug text-cream/45">
                {favorite.title}
              </span>
            )}

            <span className="pointer-events-none absolute bottom-2 left-2 z-1 rounded-full border border-cream/15 bg-black/60 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-cream/85 uppercase backdrop-blur-md">
              {mediaType === "tv" ? "Series" : "Film"}
            </span>

            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_40%,rgba(0,0,0,0.35)_100%)] opacity-50 transition-opacity duration-700 ease-out group-hover:opacity-70"
            />
          </div>
        </Link>

        <div className="pointer-events-none absolute inset-x-2 top-2 z-10 flex justify-between">
          {favorite.rating != null ? (
            <span className="inline-flex h-6 items-center gap-1 rounded-full border border-amber/25 bg-black/60 px-2 text-[11px] font-medium leading-none text-cream/90 backdrop-blur-md">
              <Star className="size-3 fill-amber text-amber" aria-hidden />
              {favorite.rating}/10
            </span>
          ) : (
            <span className="inline-flex h-6 items-center rounded-full border border-cream/12 bg-black/50 px-2 text-[10px] font-medium tracking-wide text-cream/45 uppercase backdrop-blur-md">
              Unrated
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex min-w-0 flex-1 flex-col">
        <Link
          href={href}
          className="line-clamp-2 text-sm font-medium leading-snug text-cream/80 transition-colors duration-300 hover:text-amber"
        >
          {favorite.title}
        </Link>

        {favorite.note ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-cream/40">
            {favorite.note}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-medium tracking-wide text-cream/55 transition-colors hover:text-amber"
          >
            Rate / note
          </button>
          <form action={removeAction} className="inline">
            <input type="hidden" name="listType" value={LIST_FAVORITE} />
            <input type="hidden" name="movieId" value={favorite.movieId} />
            <input type="hidden" name="title" value={favorite.title} />
            <input type="hidden" name="mediaType" value={mediaType} />
            <input
              type="hidden"
              name="posterPath"
              value={favorite.posterPath ?? ""}
            />
            <button
              type="submit"
              disabled={removing}
              className={cn(
                "text-xs tracking-wide text-cream/35 transition-colors hover:text-cream/70 disabled:opacity-60",
              )}
            >
              {removing ? "Removing…" : "Remove"}
            </button>
          </form>
        </div>
      </div>

      {modal}
    </li>
  );
}
