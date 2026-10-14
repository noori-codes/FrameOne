"use client";

import { useActionState, useState } from "react";
import { signup, type AuthFormState } from "@/app/actions/auth";
import {
  AuthError,
  AuthField,
  AuthFooterLink,
  AuthPasswordField,
  AuthSubmitButton,
} from "@/components/auth-ui";
import {
  EMAIL_MAX,
  EMAIL_PATTERN,
  NAME_MAX,
  PASSWORD_MAX,
  PASSWORD_MIN,
  sanitizeEmailInput,
} from "@/lib/auth-validation";

const initial: AuthFormState = {};

export function SignUpForm() {
  const [state, action, pending] = useActionState(signup, initial);
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="flex w-full flex-col gap-5">
      <AuthField
        label={
          <>
            Name{" "}
            <span className="font-normal text-cream/35">(optional)</span>
          </>
        }
        name="name"
        type="text"
        autoComplete="name"
        maxLength={NAME_MAX}
        placeholder="How we greet you"
        title={`Up to ${NAME_MAX} characters`}
        onBlur={(e) => {
          e.currentTarget.value = e.currentTarget.value.trim();
        }}
      />

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

      <AuthPasswordField
        label="Password"
        name="password"
        required
        minLength={PASSWORD_MIN}
        maxLength={PASSWORD_MAX}
        autoComplete="new-password"
        placeholder={`At least ${PASSWORD_MIN} characters`}
        title={`Password must be ${PASSWORD_MIN}–${PASSWORD_MAX} characters`}
      />

      {state.error ? <AuthError>{state.error}</AuthError> : null}

      <AuthSubmitButton pending={pending} pendingLabel="Creating account…">
        Create account
      </AuthSubmitButton>

      <AuthFooterLink
        prompt="Already have an account?"
        href="/signin"
        label="Sign in"
      />
    </form>
  );
}
