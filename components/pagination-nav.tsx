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
      className="mt-10 flex items-center justify-between gap-4 border-t border-cream/10 pt-6"
      aria-label="Pagination"
    >
      {prevHref ? (
        <Link
          href={prevHref}
          className="rounded-sm border border-cream/20 px-3 py-1.5 text-sm text-cream transition-colors hover:border-amber hover:text-amber"
        >
          ← Previous
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm text-cream/25">← Previous</span>
      )}

      <p className="text-sm text-cream/50">
        Page {page} of {totalPages}
      </p>

      {nextHref ? (
        <Link
          href={nextHref}
          className="rounded-sm border border-cream/20 px-3 py-1.5 text-sm text-cream transition-colors hover:border-amber hover:text-amber"
        >
          Next →
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
