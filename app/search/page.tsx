import { SearchExperience } from "@/components/search-experience";
import { parsePageParam } from "@/components/pagination-nav";
import {
  getMovieGenres,
  getTrendingMovies,
  searchMulti,
  type PaginatedSearch,
} from "@/lib/tmdb";

/**
 * /search?q=inception
 * Live typing is client-debounced; idle shows trending + genre shortcuts.
 */
type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

const FEATURED_GENRE_IDS = [
  28, // Action
  12, // Adventure
  16, // Animation
  35, // Comedy
  80, // Crime
  18, // Drama
  14, // Fantasy
  27, // Horror
  10749, // Romance
  878, // Sci-Fi
  53, // Thriller
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", page: pageRaw } = await searchParams;
  const query = q.trim();
  const page = parsePageParam(pageRaw);

  const [initialData, trending, allGenres] = await Promise.all([
    query
      ? searchMulti(query, page).catch((err) => {
          console.warn(`Search for "${query}" failed:`, err);
          return {
            results: [],
            page,
            totalPages: 0,
            totalResults: 0,
          } satisfies PaginatedSearch;
        })
      : Promise.resolve(null),
    getTrendingMovies("day").catch(() => []),
    getMovieGenres().catch(() => []),
  ]);

  const genreById = new Map(allGenres.map((g) => [g.id, g]));
  const genres = FEATURED_GENRE_IDS.map((id) => genreById.get(id)).filter(
    (g): g is NonNullable<typeof g> => Boolean(g),
  );

  return (
    <SearchExperience
      initialQuery={query}
      initialPage={page}
      initialData={initialData}
      trending={trending.slice(0, 18)}
      genres={genres}
    />
  );
}
