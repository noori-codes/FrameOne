import { NextResponse } from "next/server";
import { getMovieTrailerKey } from "@/lib/tmdb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const movieId = Number(id);
  if (!Number.isSafeInteger(movieId) || movieId <= 0) {
    return NextResponse.json({ error: "Invalid movie id" }, { status: 400 });
  }

  try {
    const youtubeKey = await getMovieTrailerKey(movieId);
    return NextResponse.json({ youtubeKey });
  } catch (error) {
    console.error(`Failed to load trailer for movie ${movieId}:`, error);
    return NextResponse.json(
      { error: "Failed to load trailer" },
      { status: 502 },
    );
  }
}
