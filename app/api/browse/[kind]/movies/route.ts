import { NextResponse } from "next/server";
import {
  getBrowseMoviesPage,
  isBrowseKind,
} from "@/lib/browse";

type RouteContext = {
  params: Promise<{ kind: string }>;
};

/**
 * GET /api/browse/:kind/movies?page=2
 * JSON feed for infinite browse grids.
 */
export async function GET(request: Request, context: RouteContext) {
  const { kind } = await context.params;
  if (!isBrowseKind(kind)) {
    return NextResponse.json({ error: "Unknown browse list" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page =
    Number.isFinite(pageRaw) && pageRaw >= 1
      ? Math.min(500, Math.floor(pageRaw))
      : 1;

  try {
    const data = await getBrowseMoviesPage(kind, page);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Failed to load ${kind} movies page ${page}:`, error);
    return NextResponse.json(
      { error: "Failed to load movies" },
      { status: 502 },
    );
  }
}
