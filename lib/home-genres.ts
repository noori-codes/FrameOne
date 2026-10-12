/** Curated genre waves for the home page (loaded progressively). */
export const HOME_GENRE_WAVES = [
  [
    { id: 28, slug: "action", title: "Action" },
    { id: 35, slug: "comedy", title: "Comedy" },
    { id: 27, slug: "horror", title: "Horror" },
    { id: 878, slug: "scifi", title: "Sci-Fi" },
  ],
  [
    { id: 18, slug: "drama", title: "Drama" },
    { id: 53, slug: "thriller", title: "Thriller" },
    { id: 16, slug: "animation", title: "Animation" },
    { id: 10749, slug: "romance", title: "Romance" },
  ],
] as const;

/** Flat list kept for any callers that need every home genre. */
export const HOME_GENRE_ROWS = HOME_GENRE_WAVES.flat();

export const GENRE_FETCH_CONCURRENCY = 4;
export const GENRE_HOME_ROW_SIZE = 12;

export function getHomeGenreWave(index: number) {
  if (index < 0 || index >= HOME_GENRE_WAVES.length) return null;
  return HOME_GENRE_WAVES[index]!;
}
