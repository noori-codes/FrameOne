"use client";

import { Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { toggleList, type ToggleListState } from "@/app/actions/favorites";
import { FavoriteMetaForm } from "@/components/favorite-meta-form";
import { MovieCard } from "@/components/movie-card";
import { LIST_FAVORITE } from "@/lib/lists";
import { posterUrl } from "@/lib/tmdb";
import { tmdbImageLoader } from "@/lib/tmdb-image-loader";

export type FavoriteRowData = {
  id: string;
  movieId: number;
  title: string;
  posterPath: string | null;
  rating: number | null;
  note: string | null;
};

type FavoriteRowProps = {
  favorite: FavoriteRowData;
};

const removeInitial: ToggleListState = {};

/**
 * Favorite shelf row — tight poster + text column; rate/note in a centered modal.
 */
export function FavoriteRow({ favorite }: FavoriteRowProps) {
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const [, removeAction, removing] = useActionState(toggleList, removeInitial);
  const poster = posterUrl(favorite.posterPath, "w342");

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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-6"
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
                      loader={tmdbImageLoader}
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
    <li className="border-b border-cream/8 py-5 last:border-b-0 sm:py-6">
      <div className="flex items-stretch gap-4 sm:gap-5">
        <div className="w-[5.5rem] shrink-0 sm:w-24">
          <MovieCard
            id={favorite.movieId}
            title={favorite.title}
            posterPath={favorite.posterPath}
            sizes="96px"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Link
            href={`/movie/${favorite.movieId}`}
            className="text-lg font-semibold leading-snug tracking-tight text-cream transition-colors hover:text-amber sm:text-xl"
          >
            {favorite.title}
          </Link>

          <div className="mt-1.5">
            {favorite.rating != null ? (
              <span className="inline-flex items-center gap-1 text-sm text-amber">
                <Star className="h-3.5 w-3.5 fill-amber" aria-hidden />
                {favorite.rating}/10
              </span>
            ) : (
              <span className="text-sm text-cream/35">Not rated</span>
            )}
          </div>

          {favorite.note ? (
            <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-cream/50">
              {favorite.note}
            </p>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-full border border-cream/20 px-3 py-1.5 text-sm text-cream/80 transition-colors hover:border-amber hover:text-amber"
            >
              Rate / note
            </button>
            <form action={removeAction}>
              <input type="hidden" name="listType" value={LIST_FAVORITE} />
              <input type="hidden" name="movieId" value={favorite.movieId} />
              <input type="hidden" name="title" value={favorite.title} />
              <input
                type="hidden"
                name="posterPath"
                value={favorite.posterPath ?? ""}
              />
              <button
                type="submit"
                disabled={removing}
                className="rounded-full px-3 py-1.5 text-sm text-cream/40 transition-colors hover:text-cream/70 disabled:opacity-60"
              >
                {removing ? "Removing…" : "Remove"}
              </button>
            </form>
            <Link
              href={`/movie/${favorite.movieId}`}
              className="rounded-full px-3 py-1.5 text-sm text-cream/40 transition-colors hover:text-amber"
            >
              Open
            </Link>
          </div>
        </div>
      </div>

      {modal}
    </li>
  );
}
