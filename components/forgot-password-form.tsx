"use client";

import { useActionState, useState } from "react";
import {
  requestPasswordReset,
  type AuthFormState,
} from "@/app/actions/auth";
import {
  AuthError,
  AuthField,
  AuthFooterLink,
  AuthSubmitButton,
} from "@/components/auth-ui";
import {
  EMAIL_MAX,
  EMAIL_PATTERN,
  sanitizeEmailInput,
} from "@/lib/auth-validation";

const initial: AuthFormState = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    initial,
  );
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="flex w-full flex-col gap-5">
      <AuthField
        label="Email"
        name="email"
        type="email"
        required
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={EMAIL_MAX}
        pattern={EMAIL_PATTERN}
        placeholder="you@example.com"
        title="Enter a valid email like you@example.com"
        value={email}
        onChange={(e) => setEmail(sanitizeEmailInput(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === " ") e.preventDefault();
        }}
      />

      {state.error ? <AuthError>{state.error}</AuthError> : null}

      <AuthSubmitButton pending={pending} pendingLabel="Sending…">
        Send reset code
      </AuthSubmitButton>

      <AuthFooterLink
        prompt="Remembered it?"
        href="/signin"
        label="Sign in"
      />
    </form>
  );
}
