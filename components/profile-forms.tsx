"use client";

import { useActionState, useRef } from "react";
import {
  changePassword,
  removeAvatar,
  updateAvatar,
  updateName,
  type ProfileFormState,
} from "@/app/actions/profile";
import { UserAvatar } from "@/components/user-avatar";

const nameInitial: ProfileFormState = {};
const passwordInitial: ProfileFormState = {};
const avatarInitial: ProfileFormState = {};

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

type AvatarFormProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

/** Upload or remove the profile photo. */
export function AvatarForm({ name, email, image }: AvatarFormProps) {
  const [uploadState, uploadAction, uploading] = useActionState(
    updateAvatar,
    avatarInitial,
  );
  const [removeState, removeAction, removing] = useActionState(
    removeAvatar,
    avatarInitial,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const message =
    uploadState.error ||
    uploadState.success ||
    removeState.error ||
    removeState.success;
  const isError = Boolean(uploadState.error || removeState.error);

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <UserAvatar name={name} email={email} image={image} size="lg" />

      <div className="flex min-w-0 flex-col gap-3">
        <form action={uploadAction} className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            name="avatar"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              if (e.currentTarget.files?.length) {
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <button
            type="button"
            disabled={uploading || removing}
            onClick={() => inputRef.current?.click()}
            className="rounded-full bg-amber px-4 py-2 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream disabled:opacity-60"
          >
            {uploading ? "Uploading…" : image ? "Change photo" : "Upload photo"}
          </button>
        </form>

        {image ? (
          <form action={removeAction}>
            <button
              type="submit"
              disabled={uploading || removing}
              className="rounded-full border border-cream/20 px-4 py-2 text-sm text-cream/70 transition-colors hover:border-cream/40 hover:text-cream disabled:opacity-60"
            >
              {removing ? "Removing…" : "Remove photo"}
            </button>
          </form>
        ) : null}

        <p className="text-xs text-cream/40">JPEG, PNG, or WebP · max 2 MB</p>

        {message ? (
          <p
            className={isError ? "text-sm text-red-400" : "text-sm text-amber"}
            role={isError ? "alert" : "status"}
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
