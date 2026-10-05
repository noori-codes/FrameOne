import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

/**
 * S3-compatible client (works with AWS S3, R2, MinIO, custom endpoints).
 * Credentials come from env — never import this into a Client Component.
 *
 * This bucket is private (object ACLs / public-read are ignored), so browsers
 * must load avatars through `/api/avatars/[userId]`, which streams GetObject.
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env.local and restart the app.`);
  }
  return value;
}

function getBucket() {
  return requireEnv("S3_BUCKET");
}

let client: S3Client | null = null;

function getS3(): S3Client {
  if (client) return client;

  client = new S3Client({
    region: requireEnv("S3_REGION"),
    endpoint: requireEnv("S3_ENDPOINT"),
    credentials: {
      accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
    },
    forcePathStyle: true,
  });

  return client;
}

/** Object key for a user avatar, e.g. avatars/cmxyz.jpg */
export function avatarObjectKey(userId: string, ext: string) {
  return `avatars/${userId}.${ext}`;
}

/**
 * Same-origin URL served by app/api/avatars/[userId].
 * Prefer this over the raw S3 public URL — the bucket is not anonymously readable.
 */
export function avatarAppUrl(userId: string, cacheBust?: number) {
  const base = `/api/avatars/${userId}`;
  return cacheBust ? `${base}?v=${cacheBust}` : base;
}

/** Upload avatar bytes; returns the object key. */
export async function uploadAvatarObject(
  key: string,
  body: Buffer,
  contentType: string,
) {
  await getS3().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return key;
}

/** Find the stored object key for a user (avatars/{userId}.*). */
export async function findUserAvatarKey(userId: string) {
  const listed = await getS3().send(
    new ListObjectsV2Command({
      Bucket: getBucket(),
      Prefix: `avatars/${userId}.`,
      MaxKeys: 5,
    }),
  );

  return (
    listed.Contents?.map((obj) => obj.Key).find(
      (key): key is string => Boolean(key),
    ) ?? null
  );
}

/** Stream avatar bytes from S3 (authenticated). */
export async function getAvatarObject(key: string) {
  const result = await getS3().send(
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
    }),
  );

  if (!result.Body) {
    return null;
  }

  const bytes = Buffer.from(await result.Body.transformToByteArray());
  return {
    bytes,
    contentType: result.ContentType ?? "application/octet-stream",
  };
}

/** Delete every object under avatars/{userId}.* */
export async function deleteUserAvatarObjects(userId: string) {
  const s3 = getS3();
  const bucket = getBucket();
  const prefix = `avatars/${userId}.`;

  const listed = await s3.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    }),
  );

  const keys = (listed.Contents ?? [])
    .map((obj) => obj.Key)
    .filter((key): key is string => Boolean(key));

  await Promise.all(
    keys.map((Key) =>
      s3
        .send(new DeleteObjectCommand({ Bucket: bucket, Key }))
        .catch(() => undefined),
    ),
  );
}
