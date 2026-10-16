import { NextResponse } from "next/server";
import {
  GENRE_FETCH_CONCURRENCY,
  GENRE_HOME_ROW_SIZE,
  HOME_GENRE_WAVES,
  getHomeGenreWave,
} from "@/lib/home-genres";
import { getMoviesByGenre, mapPool } from "@/lib/tmdb";

export const revalidate = 3600;

/**
 * GET /api/home/genre-rows?wave=0
 * Deferred home genre carousels — one wave (4 rows) at a time.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const waveRaw = Number(searchParams.get("wave") ?? "0");
  const waveIndex =
    Number.isFinite(waveRaw) && waveRaw >= 0
      ? Math.min(HOME_GENRE_WAVES.length - 1, Math.floor(waveRaw))
      : 0;

  const genres = getHomeGenreWave(waveIndex);
  if (!genres) {
    return NextResponse.json({ error: "Unknown wave" }, { status: 404 });
  }

  try {
    const rows = await mapPool(
      [...genres],
      GENRE_FETCH_CONCURRENCY,
      async (genre) => ({
        id: genre.id,
        slug: genre.slug,
        title: genre.title,
        movies: await getMoviesByGenre(genre.id, 1)
          .then((page) => page.results.slice(0, GENRE_HOME_ROW_SIZE))
          .catch((err) => {
            console.warn(`Home genre row ${genre.id} failed:`, err);
            return [];
          }),
      }),
    );

    return NextResponse.json(
      {
        wave: waveIndex,
        totalWaves: HOME_GENRE_WAVES.length,
        rows,
      },
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
