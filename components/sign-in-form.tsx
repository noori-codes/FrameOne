"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthFormState } from "@/app/actions/auth";

const initial: AuthFormState = {};

export function SignInForm() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} className="mt-8 flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-cream/70">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-sm border border-cream/20 bg-stage px-3 py-2 text-cream outline-none focus:border-amber"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-cream/70">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-sm border border-cream/20 bg-stage px-3 py-2 text-cream outline-none focus:border-amber"
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
        className="mt-2 rounded-sm bg-amber px-5 py-2.5 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-sm text-cream/50">
        No account?{" "}
        <Link href="/signup" className="text-amber hover:text-cream">
          Sign up
        </Link>
      </p>
    </form>
  );
}
