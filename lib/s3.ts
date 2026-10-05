import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

/**
 * S3-compatible client (works with AWS S3, R2, MinIO, custom endpoints).
 * Credentials come from env — never import this into a Client Component.
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

function getPublicBase() {
  return requireEnv("S3_PUBLIC_URL").replace(/\/$/, "");
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
    // Path-style works with most custom/S3-compatible hosts
    forcePathStyle: true,
  });

  return client;
}

/** Object key for a user avatar, e.g. avatars/cmxyz.jpg */
export function avatarObjectKey(userId: string, ext: string) {
  return `avatars/${userId}.${ext}`;
}

/** Public URL served by the bucket CDN / public endpoint. */
export function avatarPublicUrl(key: string, cacheBust?: number) {
  const base = `${getPublicBase()}/${key}`;
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
      s3.send(new DeleteObjectCommand({ Bucket: bucket, Key })).catch(() => undefined),
    ),
  );
}
