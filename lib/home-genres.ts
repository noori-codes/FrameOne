/** Genre rows shown on the home page (below discovery rows). */
export const HOME_GENRE_ROWS = [
  { id: 35, slug: "comedy", title: "Comedy" },
  { id: 10751, slug: "family", title: "Family" },
  { id: 28, slug: "action", title: "Action" },
  { id: 12, slug: "adventure", title: "Adventure" },
  { id: 27, slug: "horror", title: "Horror" },
  { id: 878, slug: "scifi", title: "Sci-Fi" },
  { id: 14, slug: "fantasy", title: "Fantasy" },
  { id: 10749, slug: "romance", title: "Romance" },
  { id: 16, slug: "animation", title: "Animation" },
  { id: 53, slug: "thriller", title: "Thriller" },
  { id: 18, slug: "drama", title: "Drama" },
  { id: 80, slug: "crime", title: "Crime" },
  { id: 9648, slug: "mystery", title: "Mystery" },
  { id: 10752, slug: "war", title: "War" },
] as const;

export const GENRE_FETCH_CONCURRENCY = 4;
export const GENRE_HOME_ROW_SIZE = 12;
