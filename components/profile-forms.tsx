"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  changePassword,
  removeAvatar,
  updateAvatar,
  updateName,
  type ProfileFormState,
} from "@/app/actions/profile";
import { AvatarCropModal } from "@/components/avatar-crop-modal";
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

/** Pick a photo → crop in a modal → upload JPEG. */
export function AvatarForm({ name, email, image }: AvatarFormProps) {
  const [uploadState, uploadAction, uploading] = useActionState(
    updateAvatar,
    avatarInitial,
  );
  const [removeState, removeAction, removing] = useActionState(
    removeAvatar,
    avatarInitial,
  );
  const [, startUpload] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const clearPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setCropSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onFilePicked = (file: File | undefined) => {
    setLocalError(null);
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setLocalError("Use a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setLocalError("Photo must be 8 MB or smaller before cropping.");
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setCropSrc(url);
  };

  const onCropped = (file: File) => {
    clearPreview();
    const data = new FormData();
    data.set("avatar", file);
    startUpload(() => {
      uploadAction(data);
    });
  };

  const message =
    localError ||
    uploadState.error ||
    uploadState.success ||
    removeState.error ||
    removeState.success;
  const isError = Boolean(
    localError || uploadState.error || removeState.error,
  );
  const busy = uploading || removing;

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <UserAvatar name={name} email={email} image={image} size="lg" />

      <div className="flex min-w-0 flex-col gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            onFilePicked(e.currentTarget.files?.[0]);
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="w-fit rounded-full bg-amber px-4 py-2 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream disabled:opacity-60"
        >
          {uploading ? "Uploading…" : image ? "Change photo" : "Upload photo"}
        </button>

        {image ? (
          <form action={removeAction}>
            <button
              type="submit"
              disabled={busy}
              className="rounded-full border border-cream/20 px-4 py-2 text-sm text-cream/70 transition-colors hover:border-cream/40 hover:text-cream disabled:opacity-60"
            >
              {removing ? "Removing…" : "Remove photo"}
            </button>
          </form>
        ) : null}

        <p className="text-xs text-cream/40">
          JPEG, PNG, or WebP · crop to a circle · saved as JPEG
        </p>

        {message ? (
          <p
            className={isError ? "text-sm text-red-400" : "text-sm text-amber"}
            role={isError ? "alert" : "status"}
          >
            {message}
          </p>
        ) : null}
      </div>

      <AvatarCropModal
        imageSrc={cropSrc ?? ""}
        open={Boolean(cropSrc)}
        onCancel={clearPreview}
        onCropped={onCropped}
      />
    </div>
  );
}
