"use client";

import { useActionState } from "react";
import {
  resendPasswordResetCode,
  resetPassword,
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
import {
  PASSWORD_MAX,
  PASSWORD_MIN,
  sanitizeOtpInput,
} from "@/lib/auth-validation";

const initial: AuthFormState = {};

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
          label="New password"
          name="password"
          required
          minLength={PASSWORD_MIN}
          maxLength={PASSWORD_MAX}
          autoComplete="new-password"
          placeholder={`At least ${PASSWORD_MIN} characters`}
          title={`Password must be ${PASSWORD_MIN}–${PASSWORD_MAX} characters`}
        />

        <AuthPasswordField
          label="Confirm password"
          name="confirmPassword"
          required
          minLength={PASSWORD_MIN}
          maxLength={PASSWORD_MAX}
          autoComplete="new-password"
          placeholder="Repeat new password"
        />

        {resetState.error ? <AuthError>{resetState.error}</AuthError> : null}

        <AuthSubmitButton pending={resetting} pendingLabel="Updating…">
          Update password
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
        {resendState.success ? (
          <AuthStatus>New code sent.</AuthStatus>
        ) : null}
        {resendState.error ? (
          <AuthError>{resendState.error}</AuthError>
        ) : null}
      </form>

      <AuthFooterLink prompt="Back to" href="/signin" label="Sign in" />
    </div>
  );
}
