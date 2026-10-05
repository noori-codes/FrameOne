import { NextResponse } from "next/server";
import { findUserAvatarKey, getAvatarObject } from "@/lib/avatars";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

/**
 * Stream avatars from Ramaki S3 (bucket is private; proxy uses credentials).
 */
export async function GET(_request: Request, context: RouteContext) {
  const { userId } = await context.params;

  // CUID / UUID-ish ids only — reject path traversal
  if (!userId || !/^[a-zA-Z0-9_-]{8,64}$/.test(userId)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const key = await findUserAvatarKey(userId);
    if (!key) {
      return new NextResponse("Not found", { status: 404 });
    }

    const object = await getAvatarObject(key);
    if (!object) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(new Uint8Array(object.bytes), {
      status: 200,
      headers: {
        "Content-Type": object.contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Content-Length": String(object.bytes.length),
      },
    });
  } catch (err) {
    console.error("Avatar proxy failed:", err);
    return new NextResponse("Not found", { status: 404 });
  }
}
