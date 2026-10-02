"use client";

import { useActionState } from "react";
import {
  changePassword,
  updateName,
  type ProfileFormState,
} from "@/app/actions/profile";

const nameInitial: ProfileFormState = {};
const passwordInitial: ProfileFormState = {};

const fieldClass =
  "rounded-sm border border-cream/20 bg-stage px-3 py-2 text-cream outline-none focus:border-amber";

export function UpdateNameForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState(updateName, nameInitial);

  return (
    <form action={action} className="flex max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-cream/70">
        Display name
        <input
          name="name"
          type="text"
          defaultValue={defaultName}
          autoComplete="name"
          className={fieldClass}
        />
      </label>
      {state.error ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-amber" role="status">
          {state.success}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-sm bg-amber px-4 py-2 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save name"}
      </button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, passwordInitial);

  return (
    <form action={action} className="flex max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-cream/70">
        Current password
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-cream/70">
        New password
        <input
          name="newPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-cream/70">
        Confirm new password
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className={fieldClass}
        />
      </label>
      {state.error ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-amber" role="status">
          {state.success}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-sm border border-cream/25 px-4 py-2 text-sm text-cream transition-colors hover:border-amber hover:text-amber disabled:opacity-60"
      >
        {pending ? "Updating…" : "Change password"}
      </button>
    </form>
  );
}
