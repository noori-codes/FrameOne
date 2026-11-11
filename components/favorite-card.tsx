"use client";

import { Pencil, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { toggleList, type ToggleListState } from "@/app/actions/favorites";
import { FavoriteMetaForm } from "@/components/favorite-meta-form";
import { RatingStars } from "@/components/rating-stars";
import {
  LIST_FAVORITE,
  MEDIA_MOVIE,
  mediaHref,
  type MediaListType,
} from "@/lib/lists";
import { posterUrl } from "@/lib/tmdb";

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
 * Letterboxd-style poster tile — idle is pure art; hover reveals rate / remove.
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
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeEditor();
            }}
          >
            <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-cream/10 bg-stage shadow-[0_32px_80px_-28px_rgba(0,0,0,0.95)]">
              <div className="relative flex items-start gap-4 border-b border-cream/8 bg-black/25 p-5 sm:p-6">
                <div className="relative aspect-2/3 w-16 shrink-0 overflow-hidden rounded-lg bg-background ring-1 ring-cream/10 sm:w-[4.5rem]">
                  {poster ? (
                    <Image
                      src={poster}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-amber uppercase">
                    Rate & note
                  </p>
                  <h2
                    id={titleId}
                    className="mt-1.5 font-display text-2xl leading-none tracking-wide text-cream uppercase"
                  >
                    {favorite.title}
                  </h2>
                  <p className="mt-2 text-xs tracking-wide text-cream/40 uppercase">
                    {mediaType === "tv" ? "Series" : "Film"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEditor}
                  aria-label="Close"
                  className="rounded-full border border-cream/15 p-2 text-cream/50 transition-colors hover:border-cream/35 hover:text-cream"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="p-5 sm:p-6">
                <FavoriteMetaForm
                  key={`${favorite.id}-${favorite.rating}-${favorite.note}`}
                  movieId={favorite.movieId}
                  mediaType={mediaType}
                  initialRating={favorite.rating}
                  initialNote={favorite.note}
                  onSuccess={closeEditor}
                />
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <li className="group relative">
      <Link
        href={href}
        className="relative block aspect-2/3 overflow-hidden rounded-xl bg-stage ring-1 ring-cream/10 transition-[transform,box-shadow,ring-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:-translate-y-1 group-hover:shadow-[0_28px_48px_-18px_rgba(0,0,0,0.85),0_0_40px_-16px_color-mix(in_srgb,var(--amber)_30%,transparent)] group-hover:ring-amber/35"
      >
        {poster ? (
          <Image
            src={poster}
            alt={favorite.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, (max-width: 1280px) 16vw, 12vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-[1.06]"
          />
        ) : (
          <span className="flex h-full items-center justify-center bg-stage p-3 text-center text-xs leading-snug text-cream/45">
            {favorite.title}
          </span>
        )}

        {/* Always-visible rating + title; note peeks when present */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 via-black/55 to-transparent px-2.5 pt-14 pb-2.5">
          <p className="line-clamp-2 text-[13px] font-medium leading-snug text-cream">
            {favorite.title}
          </p>
          <div className="mt-1.5">
            <RatingStars value={favorite.rating} size="sm" showValue />
          </div>
          {favorite.note ? (
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-cream/50">
              {favorite.note}
            </p>
          ) : null}
        </div>
      </Link>

      {/* Action dock — appears on hover */}
      <div className="pointer-events-none absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 transition-[opacity,transform] duration-300 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Rate ${favorite.title}`}
          className="flex size-8 items-center justify-center rounded-full border border-cream/15 bg-black/65 text-cream/85 backdrop-blur-md transition-[border-color,background-color,color] hover:border-amber/45 hover:bg-amber/15 hover:text-amber"
        >
          <Pencil className="size-3.5" />
        </button>
        <form action={removeAction}>
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
            aria-label={`Remove ${favorite.title}`}
            className="flex size-8 items-center justify-center rounded-full border border-cream/15 bg-black/65 text-cream/70 backdrop-blur-md transition-[border-color,background-color,color] hover:border-red-400/40 hover:bg-red-500/15 hover:text-red-300 disabled:opacity-60"
          >
            <Trash2 className="size-3.5" />
          </button>
        </form>
      </div>

      {modal}
    </li>
  );
}
