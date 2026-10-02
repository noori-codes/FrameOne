"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ProfileFormState = {
  error?: string;
  success?: string;
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
