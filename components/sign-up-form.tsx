"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup, type AuthFormState } from "@/app/actions/auth";

const initial: AuthFormState = {};

const fieldClass =
  "w-full rounded-sm border border-cream/20 bg-stage/80 px-3.5 py-2.5 text-cream outline-none transition-[border-color,box-shadow] placeholder:text-cream/25 focus:border-amber/60 focus:ring-1 focus:ring-amber/40";

export function SignUpForm() {
  const [state, action, pending] = useActionState(signup, initial);

  return (
    <form action={action} className="flex w-full flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm text-cream/65">
        Name{" "}
        <span className="font-normal text-cream/35">(optional)</span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          placeholder="How we greet you"
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-cream/65">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-cream/65">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          className={fieldClass}
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
        className="mt-1 min-h-11 w-full rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-cream/45">
        Already have an account?{" "}
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
