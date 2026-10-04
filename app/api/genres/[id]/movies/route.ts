import { NextResponse } from "next/server";
import {
  getMovieGenres,
  getMoviesByGenre,
  parseGenreSort,
} from "@/lib/tmdb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/genres/:id/movies?page=2&sort=popular
 * JSON feed for infinite scroll on the genre page.
 */
export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const genreId = Number(id);
  if (!Number.isFinite(genreId) || genreId <= 0) {
    return NextResponse.json({ error: "Invalid genre" }, { status: 400 });
  }

  const genres = await getMovieGenres();
  if (!genres.some((g) => g.id === genreId)) {
    return NextResponse.json({ error: "Unknown genre" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page =
    Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;
  const sort = parseGenreSort(searchParams.get("sort"));

  try {
    const data = await getMoviesByGenre(genreId, page, sort);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to load movies" },
      { status: 502 },
    );
  }
}
