"use client";

import { useActionState } from "react";
import {
  resendVerificationCode,
  verifyEmail,
  type AuthFormState,
} from "@/app/actions/auth";
import {
  AuthError,
  AuthField,
  AuthFooterLink,
  AuthPasswordField,
  AuthStatus,
  AuthSubmitButton,
} from "@/components/auth-ui";
import { PASSWORD_MAX, sanitizeOtpInput } from "@/lib/auth-validation";

const initial: AuthFormState = {};

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

        <AuthField
          label="6-digit code"
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
          className="tracking-[0.4em]"
          onInput={(e) => {
            e.currentTarget.value = sanitizeOtpInput(e.currentTarget.value);
          }}
        />

        <AuthPasswordField
          label={
            <>
              Password{" "}
              <span className="font-normal text-cream/35">(to sign you in)</span>
            </>
          }
          name="password"
          required
          maxLength={PASSWORD_MAX}
          autoComplete="current-password"
          placeholder="Your account password"
        />

        {verifyState.error ? <AuthError>{verifyState.error}</AuthError> : null}

        <AuthSubmitButton pending={verifying} pendingLabel="Verifying…">
          Verify & continue
        </AuthSubmitButton>
      </form>

      <form action={resendAction} className="flex flex-col items-center gap-2">
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={resending}
          className="text-sm text-cream/50 transition-colors hover:text-amber disabled:opacity-60"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
        {resendState.success ? <AuthStatus>New code sent.</AuthStatus> : null}
        {resendState.error ? <AuthError>{resendState.error}</AuthError> : null}
      </form>

      <AuthFooterLink
        prompt="Wrong email?"
        href="/signup"
        label="Sign up again"
      />
    </div>
  );
}
