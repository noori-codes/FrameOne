"use client";

import Image from "next/image";
import { useState } from "react";
import { TrailerButton } from "@/components/trailer-button";
import {
  stillUrl,
  type TmdbImageAsset,
  type TmdbVideo,
} from "@/lib/tmdb";
import { cn } from "@/lib/utils";

type TitleMediaProps = {
  title: string;
  clips: TmdbVideo[];
  stills: TmdbImageAsset[];
  className?: string;
};

/**
 * Horizontal videos + stills strip for a title page.
 */
export function TitleMedia({
  title,
  clips,
  stills,
  className,
}: TitleMediaProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (clips.length === 0 && stills.length === 0) return null;

  return (
    <section
      aria-labelledby="media-heading"
      className={cn("border-t border-cream/10 pt-8 sm:pt-10", className)}
    >
      <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase sm:text-xs">
        Look & listen
      </p>
      <h2
        id="media-heading"
        className="mt-2 font-display text-4xl tracking-wide text-cream uppercase sm:text-5xl"
      >
        Videos & stills
      </h2>

      {clips.length > 0 ? (
        <ul className="mt-6 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden">
          {clips.map((clip) => (
            <li key={clip.key} className="w-[16rem] shrink-0 sm:w-[18rem]">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-stage ring-1 ring-cream/10">
                <Image
                  src={`https://i.ytimg.com/vi/${clip.key}/hqdefault.jpg`}
                  alt=""
                  fill
                  sizes="288px"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-black/35"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <TrailerButton
                    youtubeKey={clip.key}
                    title={`${title} — ${clip.name}`}
                    label={clip.type === "Trailer" ? "Play trailer" : "Play"}
                    variant="ghost"
                    className="!min-h-10 !border-cream/25 !bg-black/55 !px-4 !text-cream backdrop-blur-md hover:!border-amber/45 hover:!text-amber"
                  />
                </div>
              </div>
              <p className="mt-2 line-clamp-1 text-sm font-medium text-cream/80">
                {clip.name}
              </p>
              <p className="text-[11px] tracking-wide text-cream/40 uppercase">
                {clip.type}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      {stills.length > 0 ? (
        <ul
          className={cn(
            "flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3.5 [&::-webkit-scrollbar]:hidden",
            clips.length > 0 ? "mt-6" : "mt-6",
          )}
        >
          {stills.map((still) => {
            const src = stillUrl(still.file_path, "w780");
            if (!src) return null;
            return (
              <li key={still.file_path} className="w-[14rem] shrink-0 sm:w-60">
                <button
                  type="button"
                  onClick={() => setLightbox(stillUrl(still.file_path, "w1280"))}
                  className="group relative block aspect-video w-full overflow-hidden rounded-xl bg-stage ring-1 ring-cream/10 transition-[ring-color,transform] duration-500 hover:-translate-y-0.5 hover:ring-amber/35"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="240px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {lightbox ? (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Still preview"
          onClick={() => setLightbox(null)}
        >
          <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl ring-1 ring-cream/15">
            <Image
              src={lightbox}
              alt=""
              fill
              sizes="90vw"
              className="object-contain bg-black"
              priority
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
