import { Redis } from "@upstash/redis";

let client: Redis | null | undefined;

export function getRedisClient() {
  if (client !== undefined) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (Boolean(url) !== Boolean(token)) {
    throw new Error(
      "Set both UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN, or leave both unset.",
    );
  }

  client = url && token ? new Redis({ url, token }) : null;
  return client;
}
