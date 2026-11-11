import type { ImageLoaderProps } from "next/image";

const POSTER_WIDTHS = [185, 342, 500] as const;
const BACKDROP_WIDTHS = [780, 1280] as const;

function closestWidth(width: number, candidates: readonly number[]): number {
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
 * Global next/image loader (see next.config.ts `images.loaderFile`).
 * Maps widths onto TMDB CDN sizes and leaves non-TMDB srcs untouched.
 * Must be the default export for Next’s custom loaderFile contract.
 *
 * Appends `?w=` so distinct Next widths never collapse to the same URL
 * (TMDB only has a few size buckets; Next warns when the loader ignores width).
 */
export default function tmdbImageLoader({ src, width }: ImageLoaderProps) {
  if (!src.includes("image.tmdb.org/t/p/")) return src;

  const match = src.match(
    /^(https:\/\/image\.tmdb\.org\/t\/p\/)([^/]+)(\/.+)$/,
  );
  if (!match) return src;

  const [, base, currentSize, path] = match;

  // Profile stills are often served as w185; TMDB has no larger profile bucket.
  if (currentSize === "w185") {
    return `${base}w185${path}?w=${width}`;
  }

  const sizeName = isBackdropSize(currentSize)
    ? `w${closestWidth(width, BACKDROP_WIDTHS)}`
    : `w${closestWidth(width, POSTER_WIDTHS)}`;

  return `${base}${sizeName}${path}?w=${width}`;
}

/** Absolute URL the browser will request for a given display width. */
export function tmdbImageUrl(src: string, width: number) {
  return tmdbImageLoader({ src, width });
}
