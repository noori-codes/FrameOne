import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { sendSignupVerificationEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

export const OTP_PURPOSE_SIGNUP = "signup";
const OTP_TTL_MS = 15 * 60 * 1000;

export function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

export function generateOtpCode() {
  return String(randomInt(100_000, 1_000_000));
}

export async function issueSignupOtp(emailRaw: string) {
  const email = normalizeEmail(emailRaw);
  const code = generateOtpCode();
  const codeHash = await bcrypt.hash(code, 8);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.emailOtp.deleteMany({
    where: { email, purpose: OTP_PURPOSE_SIGNUP },
  });

  await prisma.emailOtp.create({
    data: {
      email,
      codeHash,
      purpose: OTP_PURPOSE_SIGNUP,
      expiresAt,
    },
  });

  await sendSignupVerificationEmail(email, code);
  return { email, expiresAt };
}

export async function verifySignupOtp(emailRaw: string, codeRaw: string) {
  const email = normalizeEmail(emailRaw);
  const code = codeRaw.replace(/\s+/g, "").trim();
  if (!/^\d{6}$/.test(code)) {
    return {
      ok: false as const,
      error: "Enter the 6-digit code from your email.",
    };
  }

  const latest = await prisma.emailOtp.findFirst({
    where: { email, purpose: OTP_PURPOSE_SIGNUP },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    return { ok: false as const, error: "No code found. Request a new one." };
  }
  if (latest.expiresAt.getTime() < Date.now()) {
    await prisma.emailOtp.deleteMany({
      where: { email, purpose: OTP_PURPOSE_SIGNUP },
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
    where: { email, purpose: OTP_PURPOSE_SIGNUP },
  });

  return { ok: true as const, email };
}
