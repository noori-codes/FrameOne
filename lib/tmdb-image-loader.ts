import type { ImageLoaderProps } from "next/image";

const POSTER_WIDTHS = [185, 342, 500] as const;
const BACKDROP_WIDTHS = [780, 1280] as const;

function closestWidth(
  width: number,
  candidates: readonly number[],
): number {
  let best = candidates[0]!;
  for (const candidate of candidates) {
    best = candidate;
    if (candidate >= width) break;
  }
  return best;
}

function isBackdropSize(size: string) {
  return size === "w780" || size === "w1280" || size === "original";
}

/**
 * Maps next/image requested widths onto TMDB CDN sizes.
 * Avoids Next’s upstream image optimizer (7s timeout on slow TMDB edges).
 */
export function tmdbImageLoader({ src, width }: ImageLoaderProps) {
  if (!src.includes("image.tmdb.org/t/p/")) return src;

  const match = src.match(
    /^(https:\/\/image\.tmdb\.org\/t\/p\/)([^/]+)(\/.+)$/,
  );
  if (!match) return src;

  const [, base, currentSize, path] = match;

  // Profile stills are often served as w185; TMDB does not expose poster sizes for them.
  if (currentSize === "w185") {
    return `${base}w185${path}`;
  }

  const sizeName = isBackdropSize(currentSize)
    ? `w${closestWidth(width, BACKDROP_WIDTHS)}`
    : `w${closestWidth(width, POSTER_WIDTHS)}`;

  return `${base}${sizeName}${path}`;
}

/** Absolute URL the browser will request for a given display width. */
export function tmdbImageUrl(src: string, width: number) {
  return tmdbImageLoader({ src, width });
}
