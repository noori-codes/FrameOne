"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import {
  EMAIL_MAX,
  isValidEmail,
  NAME_MAX,
  PASSWORD_MAX,
  PASSWORD_MIN,
} from "@/lib/auth-validation";
import { issueSignupOtp, normalizeEmail, verifySignupOtp } from "@/lib/email-otp";
import { prisma } from "@/lib/prisma";

export type AuthFormState = {
  error?: string;
  success?: boolean;
  /** Set after signup — UI can route to verify. */
  verifyEmail?: string;
};

export async function signup(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (name.length > NAME_MAX) {
    return { error: `Name must be at most ${NAME_MAX} characters.` };
  }
  if (email.length > EMAIL_MAX || !isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < PASSWORD_MIN) {
    return { error: `Password must be at least ${PASSWORD_MIN} characters.` };
  }
  if (password.length > PASSWORD_MAX) {
    return { error: `Password must be at most ${PASSWORD_MAX} characters.` };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.emailVerified) {
    return { error: "An account with that email already exists." };
  }

  const hashed = await bcrypt.hash(password, 10);

  if (existing && !existing.emailVerified) {
    // Allow retrying signup for an unverified row
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: name || null,
        password: hashed,
      },
    });
  } else {
    await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashed,
        emailVerified: null,
      },
    });
  }

  try {
    await issueSignupOtp(email);
  } catch (err) {
    console.error("Failed to send verification email:", err);
    return {
      error:
        "Account saved, but we couldn’t send the verification email. Check email settings and try again.",
      verifyEmail: email,
    };
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export async function verifyEmail(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const code = String(formData.get("code") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !code) {
    return { error: "Email and verification code are required." };
  }

  const checked = await verifySignupOtp(email, code);
  if (!checked.ok) {
    return { error: checked.error };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "No account found for that email. Sign up again." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  // Optional: auto sign-in if they also submitted password on verify form
  if (password) {
    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/",
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return {
          success: true,
          error: "Email verified — sign in with your password.",
        };
      }
      throw error;
    }
  }

  redirect("/signin?verified=1");
}

export async function resendVerificationCode(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!email) return { error: "Email is required." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "No account found for that email." };
  }
  if (user.emailVerified) {
    return { error: "That email is already verified. Sign in." };
  }

  try {
    await issueSignupOtp(email);
  } catch (err) {
    console.error("Failed to resend verification email:", err);
    return { error: "Couldn’t send the code. Try again in a moment." };
  }

  return { success: true, verifyEmail: email };
}

export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (email.length > EMAIL_MAX || !isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length > PASSWORD_MAX) {
    return { error: "Invalid email or password." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  });

  if (user && !user.emailVerified) {
    try {
      await issueSignupOtp(email);
    } catch {
      // Still send them to verify even if resend fails
    }
    redirect(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  const callbackRaw = String(formData.get("callbackUrl") ?? "").trim();
  const redirectTo =
    callbackRaw.startsWith("/") && !callbackRaw.startsWith("//")
      ? callbackRaw
      : "/";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  return { success: true };
}
