"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  requestPasswordReset,
  type AuthFormState,
} from "@/app/actions/auth";
import {
  EMAIL_MAX,
  EMAIL_PATTERN,
  sanitizeEmailInput,
} from "@/lib/auth-validation";

const initial: AuthFormState = {};

const fieldClass =
  "w-full rounded-sm border border-cream/20 bg-stage/80 px-3.5 py-2.5 text-cream outline-none transition-[border-color,box-shadow] placeholder:text-cream/25 focus:border-amber/60 focus:ring-1 focus:ring-amber/40";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    initial,
  );
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="flex w-full flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm text-cream/65">
        Email
        <input
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
          className={fieldClass}
          value={email}
          onChange={(e) => setEmail(sanitizeEmailInput(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === " ") e.preventDefault();
          }}
        />
      </label>

      {state.error ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 min-h-11 w-full rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-[color:var(--on-amber)] transition-colors hover:bg-(--amber-dim) hover:text-cream disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset code"}
      </button>

      <p className="text-center text-sm text-cream/45">
        Remembered it?{" "}
        <Link
          href="/signin"
          className="text-cream/80 transition-colors hover:text-amber"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
