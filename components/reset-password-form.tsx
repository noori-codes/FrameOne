"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  resendPasswordResetCode,
  resetPassword,
  type AuthFormState,
} from "@/app/actions/auth";
import {
  PASSWORD_MAX,
  PASSWORD_MIN,
  sanitizeOtpInput,
} from "@/lib/auth-validation";

const initial: AuthFormState = {};

const fieldClass =
  "w-full rounded-sm border border-cream/20 bg-stage/80 px-3.5 py-2.5 text-cream outline-none transition-[border-color,box-shadow] placeholder:text-cream/25 focus:border-amber/60 focus:ring-1 focus:ring-amber/40";

type ResetPasswordFormProps = {
  email: string;
};

export function ResetPasswordForm({ email }: ResetPasswordFormProps) {
  const [resetState, resetAction, resetting] = useActionState(
    resetPassword,
    initial,
  );
  const [resendState, resendAction, resending] = useActionState(
    resendPasswordResetCode,
    initial,
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <form action={resetAction} className="flex flex-col gap-5">
        <input type="hidden" name="email" value={email} />

        <label className="flex flex-col gap-1.5 text-sm text-cream/65">
          6-digit code
          <input
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            minLength={6}
            required
            autoComplete="one-time-code"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="••••••"
            title="Enter the 6-digit code from your email"
            className={`${fieldClass} tracking-[0.35em]`}
            onInput={(e) => {
              e.currentTarget.value = sanitizeOtpInput(e.currentTarget.value);
            }}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-cream/65">
          New password
          <input
            name="password"
            type="password"
            required
            minLength={PASSWORD_MIN}
            maxLength={PASSWORD_MAX}
            autoComplete="new-password"
            placeholder={`At least ${PASSWORD_MIN} characters`}
            title={`Password must be ${PASSWORD_MIN}–${PASSWORD_MAX} characters`}
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-cream/65">
          Confirm password
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={PASSWORD_MIN}
            maxLength={PASSWORD_MAX}
            autoComplete="new-password"
            placeholder="Repeat new password"
            className={fieldClass}
          />
        </label>

        {resetState.error ? (
          <p className="text-sm text-red-400" role="alert">
            {resetState.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={resetting}
          className="mt-1 min-h-11 w-full rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-[color:var(--on-amber)] transition-colors hover:bg-(--amber-dim) disabled:opacity-60"
        >
          {resetting ? "Updating…" : "Update password"}
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
        Back to{" "}
        <Link
          href="/signin"
          className="text-cream/80 transition-colors hover:text-amber"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
