"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  resendVerificationCode,
  verifyEmail,
  type AuthFormState,
} from "@/app/actions/auth";

const initial: AuthFormState = {};

const fieldClass =
  "w-full rounded-sm border border-cream/20 bg-stage/80 px-3.5 py-2.5 text-cream outline-none transition-[border-color,box-shadow] placeholder:text-cream/25 focus:border-amber/60 focus:ring-1 focus:ring-amber/40";

type VerifyEmailFormProps = {
  email: string;
};

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const [verifyState, verifyAction, verifying] = useActionState(
    verifyEmail,
    initial,
  );
  const [resendState, resendAction, resending] = useActionState(
    resendVerificationCode,
    initial,
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <form action={verifyAction} className="flex flex-col gap-5">
        <input type="hidden" name="email" value={email} />

        <label className="flex flex-col gap-1.5 text-sm text-cream/65">
          6-digit code
          <input
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
            placeholder="••••••"
            className={`${fieldClass} tracking-[0.35em]`}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-cream/65">
          Password{" "}
          <span className="font-normal text-cream/35">(to sign you in)</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Your account password"
            className={fieldClass}
          />
        </label>

        {verifyState.error ? (
          <p className="text-sm text-red-400" role="alert">
            {verifyState.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={verifying}
          className="mt-1 min-h-11 w-full rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-[color:var(--on-amber)] transition-colors hover:bg-(--amber-dim) disabled:opacity-60"
        >
          {verifying ? "Verifying…" : "Verify & continue"}
        </button>
      </form>

      <form action={resendAction} className="flex flex-col items-center gap-2">
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={resending}
          className="text-sm text-cream/55 transition-colors hover:text-amber disabled:opacity-60"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
        {resendState.success ? (
          <p className="text-xs text-amber" role="status">
            New code sent.
          </p>
        ) : null}
        {resendState.error ? (
          <p className="text-xs text-red-400" role="alert">
            {resendState.error}
          </p>
        ) : null}
      </form>

      <p className="text-center text-sm text-cream/45">
        Wrong email?{" "}
        <Link
          href="/signup"
          className="text-cream/80 transition-colors hover:text-amber"
        >
          Sign up again
        </Link>
      </p>
    </div>
  );
}
