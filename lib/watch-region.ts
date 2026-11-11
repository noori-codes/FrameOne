export const WATCH_REGION_COOKIE = "fo_watch_region";

/** Common JustWatch/TMDB regions — keep the list short and readable. */
export const WATCH_REGIONS = [
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "IN", label: "India" },
  { code: "BR", label: "Brazil" },
  { code: "JP", label: "Japan" },
  { code: "AE", label: "UAE" },
] as const;

export type WatchRegionCode = (typeof WATCH_REGIONS)[number]["code"];

export function resolveWatchRegion(raw?: string | null): WatchRegionCode {
  const code = raw?.trim().toUpperCase();
  const match = WATCH_REGIONS.find((r) => r.code === code);
  if (match) return match.code;

  const env = process.env.TMDB_WATCH_REGION?.trim().toUpperCase();
  const envMatch = WATCH_REGIONS.find((r) => r.code === env);
  return envMatch?.code ?? "US";
}
