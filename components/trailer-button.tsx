"use client";

import { Play, X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

function youtubeEmbedUrl(key: string) {
  return `https://www.youtube.com/embed/${key}?autoplay=1&rel=0`;
}

function subscribeMounted() {
  return () => {};
}

function getMountedSnapshot() {
  return true;
}

function getServerMountedSnapshot() {
  return false;
}

type TrailerButtonProps = {
  /** YouTube video key from TMDB; null = no trailer */
  youtubeKey: string | null;
  /** Fetch the trailer on demand when the key was not loaded with the page. */
  movieId?: number;
  title: string;
  label?: string;
  className?: string;
  /** Ghost outline style instead of amber primary */
  variant?: "primary" | "ghost";
  /** Notify parent when the modal opens/closes (e.g. pause a carousel). */
  onOpenChange?: (open: boolean) => void;
};

/**
 * Opens an in-page YouTube embed for the TMDB trailer.
 * Hidden (returns null) when there is no trailer key.
 * Modal is portaled to body so hero transforms don’t pin it to a corner.
 */
export function TrailerButton({
  youtubeKey,
  movieId,
  title,
  label = "Watch trailer",
  className,
  variant = "primary",
  onOpenChange,
}: TrailerButtonProps) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeMounted,
    getMountedSnapshot,
    getServerMountedSnapshot,
  );
  const [resolvedYoutubeKey, setResolvedYoutubeKey] = useState(youtubeKey);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [trailerError, setTrailerError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  function setTrailerOpen(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  async function openTrailer() {
    setTrailerError(null);
    let key = resolvedYoutubeKey;

    if (!key && movieId != null) {
      setLoadingTrailer(true);
      try {
        const response = await fetch(`/api/movies/${movieId}/trailer`);
        if (!response.ok) throw new Error("Couldn’t load this trailer.");
        const data = (await response.json()) as { youtubeKey: string | null };
        key = data.youtubeKey;
        setResolvedYoutubeKey(key);
        if (!key) {
          setTrailerError("No trailer is available for this movie.");
          return;
        }
      } catch (error) {
        setTrailerError(
          error instanceof Error ? error.message : "Couldn’t load this trailer.",
        );
        return;
      } finally {
        setLoadingTrailer(false);
      }
    }

    if (key) setTrailerOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setTrailerOpen(false);
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only bind while open
  }, [open]);

  if (!resolvedYoutubeKey && movieId == null) return null;

  const modal =
    open && mounted
      ? createPortal(
          <div
            className="trailer-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-3 sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => {
              if (e.target === e.currentTarget) setTrailerOpen(false);
            }}
          >
            <div className="trailer-modal-panel relative my-auto w-full max-w-5xl lg:max-w-6xl">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--amber)_28%,transparent),transparent_65%)] blur-2xl"
              />
              <div className="relative flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-2xl bg-black shadow-[0_32px_80px_-20px_rgba(0,0,0,0.9)] ring-1 ring-cream/20 sm:max-h-[calc(100dvh-2.5rem)]">
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-cream/10 bg-linear-to-r from-black via-stage/80 to-black px-3 py-2.5 sm:gap-4 sm:px-5 sm:py-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-amber uppercase">
                      Now playing
                    </p>
                    <p
                      id={titleId}
                      className="truncate font-display text-sm text-cream sm:text-lg"
                    >
                      {title}
                      <span className="text-cream/45"> · Trailer</span>
                    </p>
                  </div>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={() => setTrailerOpen(false)}
                    aria-label="Close trailer"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-cream/20 bg-black/40 text-cream/80 transition-[color,border-color,background-color,transform] duration-200 hover:border-cream/45 hover:bg-cream/10 hover:text-cream active:scale-95 sm:size-10"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="trailer-modal-video min-h-0 w-full flex-1 bg-black">
                  <iframe
                    title={`${title} trailer`}
                    src={youtubeEmbedUrl(resolvedYoutubeKey!)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => void openTrailer()}
        disabled={loadingTrailer}
        aria-busy={loadingTrailer}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-wait disabled:opacity-70",
          variant === "primary"
            ? "bg-amber text-[color:var(--on-amber)] hover:bg-(--amber-dim) hover:text-cream"
            : "border border-cream/30 bg-black/20 text-cream/85 backdrop-blur-sm hover:border-cream/50 hover:text-cream",
          className,
        )}
      >
        <Play className="h-4 w-4 fill-current" aria-hidden />
        {loadingTrailer ? "Loading trailer…" : label}
      </button>
      {trailerError ? (
        <p className="text-xs text-rose-200" role="alert">
          {trailerError}
        </p>
      ) : null}
      {modal}
    </>
  );
}
