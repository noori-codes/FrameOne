"use client";

import { Calendar, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useActionState,
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  toggleWatched,
  updateWatchedDate,
  type ToggleListState,
  type WatchedDateState,
} from "@/app/actions/favorites";
import {
  MEDIA_MOVIE,
  mediaHref,
  type MediaListType,
} from "@/lib/lists";
import { posterUrl } from "@/lib/tmdb";

export type WatchedCardData = {
  id: string;
  movieId: number;
  title: string;
  posterPath: string | null;
  watchedAt: Date | string | null;
  mediaType?: MediaListType;
};

type WatchedCardProps = {
  item: WatchedCardData;
  priority?: boolean;
};

const removeInitial: ToggleListState = {};
const dateInitial: WatchedDateState = {};

function toDateInputValue(value: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatWatchedDate(value: Date | string | null) {
  if (!value) return "Date unknown";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Date unknown";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Diary tile — poster-first with watch date; hover for edit date / unwatch.
 */
export function WatchedCard({ item, priority = false }: WatchedCardProps) {
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const [, removeAction, removing] = useActionState(
    toggleWatched,
    removeInitial,
  );
  const [dateState, dateAction, datePending] = useActionState(
    updateWatchedDate,
    dateInitial,
  );
  const poster = posterUrl(item.posterPath, "w500");
  const mediaType = item.mediaType ?? MEDIA_MOVIE;
  const href = mediaHref(mediaType, item.movieId);

  const closeEditor = useCallback(() => setEditing(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (dateState.success) closeEditor();
  }, [dateState.success, closeEditor]);

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
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-cream/10 bg-stage shadow-[0_32px_80px_-28px_rgba(0,0,0,0.95)]">
              <div className="flex items-start justify-between gap-3 border-b border-cream/8 px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-amber uppercase">
                    Watch date
                  </p>
                  <h2
                    id={titleId}
                    className="mt-1 truncate font-display text-2xl tracking-wide text-cream uppercase"
                  >
                    {item.title}
                  </h2>
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

              <form action={dateAction} className="flex flex-col gap-4 p-5 sm:p-6">
                <input type="hidden" name="movieId" value={item.movieId} />
                <input type="hidden" name="mediaType" value={mediaType} />
                <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.18em] text-cream/45 uppercase">
                  Watched on
                  <input
                    type="date"
                    name="watchedAt"
                    required
                    defaultValue={toDateInputValue(item.watchedAt)}
                    max={toDateInputValue(new Date())}
                    className="rounded-xl border border-cream/12 bg-black/35 px-4 py-3 text-sm font-normal normal-case tracking-normal text-cream outline-none transition-[border-color,box-shadow] focus:border-amber/45 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--amber)_12%,transparent)]"
                  />
                </label>
                {dateState.error ? (
                  <p className="text-sm text-red-400" role="alert">
                    {dateState.error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={datePending}
                  className="cta-shine relative inline-flex w-fit overflow-hidden rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-[color:var(--on-amber)] transition-colors hover:bg-(--amber-dim) hover:text-cream disabled:opacity-60"
                >
                  {datePending ? "Saving…" : "Save date"}
                </button>
              </form>
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
            alt={item.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, (max-width: 1280px) 16vw, 12vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-[1.06]"
          />
        ) : (
          <span className="flex h-full items-center justify-center bg-stage p-3 text-center text-xs leading-snug text-cream/45">
            {item.title}
          </span>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/35 to-transparent px-2.5 pt-12 pb-2.5 transition-opacity duration-300 group-hover:opacity-0">
          <p className="text-[11px] font-medium text-cream/75">
            {formatWatchedDate(item.watchedAt)}
          </p>
        </div>

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black via-black/70 to-black/10 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
          <p className="line-clamp-2 text-[13px] font-medium leading-snug text-cream">
            {item.title}
          </p>
          <p className="mt-1.5 text-[11px] text-cream/55">
            {formatWatchedDate(item.watchedAt)}
          </p>
          <p className="mt-1 text-[11px] tracking-wide text-cream/40 uppercase">
            {mediaType === "tv" ? "Series" : "Film"}
          </p>
        </div>
      </Link>

      <div className="pointer-events-none absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Edit watch date for ${item.title}`}
          className="flex size-8 items-center justify-center rounded-full border border-cream/15 bg-black/65 text-cream/85 backdrop-blur-md transition-[border-color,background-color,color] hover:border-amber/45 hover:bg-amber/15 hover:text-amber"
        >
          <Calendar className="size-3.5" />
        </button>
        <form action={removeAction}>
          <input type="hidden" name="movieId" value={item.movieId} />
          <input type="hidden" name="title" value={item.title} />
          <input type="hidden" name="mediaType" value={mediaType} />
          <input
            type="hidden"
            name="posterPath"
            value={item.posterPath ?? ""}
          />
          <button
            type="submit"
            disabled={removing}
            aria-label={`Remove ${item.title} from watched`}
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
