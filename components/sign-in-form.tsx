"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, type AuthFormState } from "@/app/actions/auth";
import {
  AuthError,
  AuthField,
  AuthFooterLink,
  AuthPasswordField,
  AuthStatus,
  AuthSubmitButton,
} from "@/components/auth-ui";
import {
  EMAIL_MAX,
  EMAIL_PATTERN,
  PASSWORD_MAX,
  sanitizeEmailInput,
} from "@/lib/auth-validation";

const initial: AuthFormState = {};

type SignInFormProps = {
  /** Where to send the user after login (from ?callbackUrl=). */
  callbackUrl?: string;
  verified?: boolean;
  reset?: boolean;
};

export function SignInForm({
  callbackUrl = "/",
  verified = false,
  reset = false,
}: SignInFormProps) {
  const [state, action, pending] = useActionState(login, initial);
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="flex w-full flex-col gap-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {verified ? (
        <AuthStatus>Email verified — you can sign in now.</AuthStatus>
      ) : null}

      {reset ? (
        <AuthStatus>
          Password updated — sign in with your new password.
        </AuthStatus>
      ) : null}

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
        hint={
          <Link
            href="/forgot-password"
            className="text-xs font-normal text-cream/40 transition-colors hover:text-amber"
          >
            Forgot password?
          </Link>
        }
        name="password"
        required
        maxLength={PASSWORD_MAX}
        autoComplete="current-password"
        placeholder="••••••••"
      />

      {state.error ? <AuthError>{state.error}</AuthError> : null}

      <AuthSubmitButton pending={pending} pendingLabel="Signing in…">
        Sign in
      </AuthSubmitButton>

      <AuthFooterLink
        prompt="No account?"
        href="/signup"
        label="Create one"
      />
    </form>
  );
}
