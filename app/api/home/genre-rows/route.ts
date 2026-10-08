import { NextResponse } from "next/server";
import {
  GENRE_FETCH_CONCURRENCY,
  GENRE_HOME_ROW_SIZE,
  HOME_GENRE_ROWS,
} from "@/lib/home-genres";
import { getMoviesByGenre, mapPool } from "@/lib/tmdb";

export const revalidate = 3600;

/**
 * GET /api/home/genre-rows
 * Deferred home genre carousels — fetched after first paint / when near viewport.
 */
export async function GET() {
  try {
    const rows = await mapPool(
      HOME_GENRE_ROWS,
      GENRE_FETCH_CONCURRENCY,
      async (genre) => ({
        id: genre.id,
        slug: genre.slug,
        title: genre.title,
        movies: (await getMoviesByGenre(genre.id, 1)).results.slice(
          0,
          GENRE_HOME_ROW_SIZE,
        ),
      }),
    );

    return NextResponse.json(
      { rows },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    console.error("Failed to load home genre rows:", error);
    return NextResponse.json(
      { error: "Failed to load genre rows" },
      { status: 502 },
    );
  }
}
