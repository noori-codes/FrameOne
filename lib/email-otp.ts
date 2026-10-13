import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import {
  sendPasswordResetEmail,
  sendSignupVerificationEmail,
} from "@/lib/mail";
import { prisma } from "@/lib/prisma";

export const OTP_PURPOSE_SIGNUP = "signup";
export const OTP_PURPOSE_RESET = "password_reset";
const OTP_TTL_MS = 15 * 60 * 1000;

export function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

export function generateOtpCode() {
  return String(randomInt(100_000, 1_000_000));
}

async function issueOtp(
  emailRaw: string,
  purpose: string,
  send: (email: string, code: string) => Promise<void>,
) {
  const email = normalizeEmail(emailRaw);
  const code = generateOtpCode();
  const codeHash = await bcrypt.hash(code, 8);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.emailOtp.deleteMany({
    where: { email, purpose },
  });

  await prisma.emailOtp.create({
    data: {
      email,
      codeHash,
      purpose,
      expiresAt,
    },
  });

  await send(email, code);
  return { email, expiresAt };
}

async function verifyOtp(emailRaw: string, codeRaw: string, purpose: string) {
  const email = normalizeEmail(emailRaw);
  const code = codeRaw.replace(/\s+/g, "").trim();
  if (!/^\d{6}$/.test(code)) {
    return {
      ok: false as const,
      error: "Enter the 6-digit code from your email.",
    };
  }

  const latest = await prisma.emailOtp.findFirst({
    where: { email, purpose },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    return { ok: false as const, error: "No code found. Request a new one." };
  }
  if (latest.expiresAt.getTime() < Date.now()) {
    await prisma.emailOtp.deleteMany({
      where: { email, purpose },
    });
    return {
      ok: false as const,
      error: "That code expired. Request a new one.",
    };
  }

  const matches = await bcrypt.compare(code, latest.codeHash);
  if (!matches) {
    return { ok: false as const, error: "Invalid code. Try again." };
  }

  await prisma.emailOtp.deleteMany({
    where: { email, purpose },
  });

  return { ok: true as const, email };
}

export async function issueSignupOtp(emailRaw: string) {
  return issueOtp(emailRaw, OTP_PURPOSE_SIGNUP, sendSignupVerificationEmail);
}

export async function verifySignupOtp(emailRaw: string, codeRaw: string) {
  return verifyOtp(emailRaw, codeRaw, OTP_PURPOSE_SIGNUP);
}

export async function issuePasswordResetOtp(emailRaw: string) {
  return issueOtp(emailRaw, OTP_PURPOSE_RESET, sendPasswordResetEmail);
}

export async function verifyPasswordResetOtp(
  emailRaw: string,
  codeRaw: string,
) {
  return verifyOtp(emailRaw, codeRaw, OTP_PURPOSE_RESET);
}
