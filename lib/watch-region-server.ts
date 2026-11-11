import { cookies } from "next/headers";
import {
  resolveWatchRegion,
  WATCH_REGION_COOKIE,
  type WatchRegionCode,
} from "@/lib/watch-region";

/** Server-only: cookie override, else env, else US. Do not import from client components. */
export async function getPreferredWatchRegion(): Promise<WatchRegionCode> {
  const jar = await cookies();
  return resolveWatchRegion(jar.get(WATCH_REGION_COOKIE)?.value);
}
