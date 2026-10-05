import Link from "next/link";

type PaginationNavProps = {
  page: number;
  totalPages: number;
  /** Full path including query, e.g. /search?q=matrix&page=1 — null = hide button */
  prevHref: string | null;
  nextHref: string | null;
};

/** Simple Previous / Next for server pages (no client JS). */
export function PaginationNav({
  page,
  totalPages,
  prevHref,
  nextHref,
}: PaginationNavProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-8 flex items-center justify-between gap-2 border-t border-cream/10 pt-5 sm:mt-10 sm:gap-4 sm:pt-6"
      aria-label="Pagination"
    >
      {prevHref ? (
        <Link
          href={prevHref}
          className="min-h-10 rounded-full border border-cream/20 px-3 py-1.5 text-sm text-cream transition-colors hover:border-amber hover:text-amber sm:px-4"
        >
          <span className="sm:hidden">← Prev</span>
          <span className="hidden sm:inline">← Previous</span>
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm text-cream/25 sm:px-4">
          <span className="sm:hidden">← Prev</span>
          <span className="hidden sm:inline">← Previous</span>
        </span>
      )}

      <p className="shrink-0 text-xs tabular-nums text-cream/50 sm:text-sm">
        {page} / {totalPages}
      </p>

      {nextHref ? (
        <Link
          href={nextHref}
          className="min-h-10 rounded-full border border-cream/20 px-3 py-1.5 text-sm text-cream transition-colors hover:border-amber hover:text-amber sm:px-4"
        >
          <span className="sm:hidden">Next →</span>
          <span className="hidden sm:inline">Next →</span>
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm text-cream/25">Next →</span>
      )}
    </nav>
  );
}

/** Turn "?page=2" into a safe page number (default 1). */
export function parsePageParam(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}
