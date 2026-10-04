"use client";

import { Play, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function youtubeEmbedUrl(key: string) {
  return `https://www.youtube.com/embed/${key}?autoplay=1&rel=0`;
}

type TrailerButtonProps = {
  /** YouTube video key from TMDB; null = no trailer */
  youtubeKey: string | null;
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
 */
export function TrailerButton({
  youtubeKey,
  title,
  label = "Watch trailer",
  className,
  variant = "primary",
  onOpenChange,
}: TrailerButtonProps) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  function setTrailerOpen(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
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

  if (!youtubeKey) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setTrailerOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
          variant === "primary"
            ? "bg-amber text-[#1a1208] hover:bg-(--amber-dim) hover:text-cream"
            : "border border-cream/30 bg-black/20 text-cream/85 backdrop-blur-sm hover:border-cream/50 hover:text-cream",
          className,
        )}
      >
        <Play className="h-4 w-4 fill-current" aria-hidden />
        {label}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(e) => {
            if (e.target === e.currentTarget) setTrailerOpen(false);
          }}
        >
          <div className="relative w-full max-w-4xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p id={titleId} className="truncate text-sm text-cream/70">
                {title} — Trailer
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setTrailerOpen(false)}
                aria-label="Close trailer"
                className="rounded-full border border-cream/25 p-1.5 text-cream/80 transition-colors hover:border-cream/45 hover:text-cream"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="aspect-video overflow-hidden rounded-lg bg-black ring-1 ring-cream/15">
              <iframe
                title={`${title} trailer`}
                src={youtubeEmbedUrl(youtubeKey)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
