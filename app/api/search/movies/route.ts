import { NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb";

/**
 * GET /api/search/movies?q=inception&page=1
 * JSON feed for live (debounced) search UI.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page =
    Number.isFinite(pageRaw) && pageRaw >= 1
      ? Math.min(500, Math.floor(pageRaw))
      : 1;

  if (!q) {
    return NextResponse.json({
      results: [],
      page: 1,
      totalPages: 0,
      totalResults: 0,
    });
  }

  try {
    const data = await searchMovies(q, page);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Failed to search movies for "${q}" page ${page}:`, error);
    return NextResponse.json(
      { error: "Failed to search movies" },
      { status: 502 },
    );
  }
}
