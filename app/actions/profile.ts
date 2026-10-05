"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  avatarObjectKey,
  avatarPublicUrl,
  deleteUserAvatarObjects,
  uploadAvatarObject,
} from "@/lib/s3";

export type ProfileFormState = {
  error?: string;
  success?: string;
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_AVATAR_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user.id;
}

/** Update display name on the User row (email stays the login id). */
export async function updateName(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const userId = await requireUserId();
  if (!userId) {
    return { error: "You must be signed in." };
  }

  const name = String(formData.get("name") ?? "").trim();

  await prisma.user.update({
    where: { id: userId },
    data: { name: name || null },
  });

  revalidatePath("/profile");
  revalidatePath("/");
  return { success: "Name updated." };
}

/**
 * Change password: verify current hash, then store a new bcrypt hash.
 * Never write the plain password to the database.
 */
export async function changePassword(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const userId = await requireUserId();
  if (!userId) {
    return { error: "You must be signed in." };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All password fields are required." };
  }
  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { error: "User not found." };
  }

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    return { error: "Current password is incorrect." };
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  revalidatePath("/profile");
  return { success: "Password changed." };
}

/** Upload a JPEG/PNG/WebP avatar (max 2 MB) to S3. */
export async function updateAvatar(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const userId = await requireUserId();
  if (!userId) {
    return { error: "You must be signed in." };
  }

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a photo to upload." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "Photo must be 2 MB or smaller." };
  }

  const ext = ALLOWED_AVATAR_TYPES[file.type];
  if (!ext) {
    return { error: "Use a JPEG, PNG, or WebP image." };
  }

  try {
    await deleteUserAvatarObjects(userId);

    const key = avatarObjectKey(userId, ext);
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadAvatarObject(key, buffer, file.type);

    // cache-bust so the header updates immediately after upload
    const image = avatarPublicUrl(key, Date.now());

    await prisma.user.update({
      where: { id: userId },
      data: { image },
    });
  } catch (err) {
    console.error("Avatar upload failed:", err);
    return { error: "Could not upload photo. Check S3 settings and try again." };
  }

  revalidatePath("/profile");
  revalidatePath("/");
  return { success: "Photo updated." };
}

/** Remove the current avatar object and clear User.image. */
export async function removeAvatar(
  _prev: ProfileFormState,
  _formData: FormData,
): Promise<ProfileFormState> {
  const userId = await requireUserId();
  if (!userId) {
    return { error: "You must be signed in." };
  }

  try {
    await deleteUserAvatarObjects(userId);
  } catch (err) {
    console.error("Avatar delete failed:", err);
    return { error: "Could not remove photo. Try again." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { image: null },
  });

  revalidatePath("/profile");
  revalidatePath("/");
  return { success: "Photo removed." };
}
