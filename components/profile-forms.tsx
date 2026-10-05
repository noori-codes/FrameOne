"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  changePassword,
  removeAvatar,
  updateAvatar,
  updateName,
  type ProfileFormState,
} from "@/app/actions/profile";
import { Camera } from "lucide-react";
import { AvatarCropModal } from "@/components/avatar-crop-modal";
import { UserAvatar } from "@/components/user-avatar";

const nameInitial: ProfileFormState = {};
const passwordInitial: ProfileFormState = {};
const avatarInitial: ProfileFormState = {};

const fieldClass =
  "w-full rounded-sm border border-cream/20 bg-stage px-3 py-2 text-cream outline-none focus:border-amber";

/** Display name as text with an inline edit control. */
export function UpdateNameForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(
    async (prev: ProfileFormState, formData: FormData) => {
      const result = await updateName(prev, formData);
      if (result.success) {
        setEditing(false);
        router.refresh();
      }
      return result;
    },
    nameInitial,
  );

  if (!editing) {
    return (
      <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 sm:justify-start">
        <p className="max-w-full text-xl font-semibold tracking-tight wrap-break-word text-cream sm:text-2xl">
          {defaultName.trim() || (
            <span className="font-normal text-cream/40">No display name</span>
          )}
        </p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-h-11 shrink-0 px-1 text-sm text-cream/45 transition-colors hover:text-amber sm:min-h-0 sm:px-0"
        >
          Edit
        </button>
        {state.success ? (
          <p className="basis-full text-sm text-amber sm:text-left" role="status">
            {state.success}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      action={action}
      className="mx-auto flex w-full max-w-sm flex-col gap-3 sm:mx-0"
    >
      <label className="flex flex-col gap-1.5 text-sm text-cream/70">
        Display name
        <input
          name="name"
          type="text"
          defaultValue={defaultName}
          autoComplete="name"
          autoFocus
          className={fieldClass}
        />
      </label>
      {state.error ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-full bg-amber px-5 py-2 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream disabled:opacity-60 sm:min-h-0 sm:px-4 sm:py-1.5"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setEditing(false)}
          className="min-h-11 rounded-full px-4 py-2 text-sm text-cream/50 transition-colors hover:text-cream disabled:opacity-60 sm:min-h-0 sm:px-3 sm:py-1.5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(
    changePassword,
    passwordInitial,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
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
        className="min-h-11 w-full rounded-full border border-cream/25 px-4 py-2.5 text-sm text-cream transition-colors hover:border-amber hover:text-amber disabled:opacity-60 sm:min-h-0 sm:w-fit sm:py-2"
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

/** Large photo with glow + hover camera; click opens crop, then uploads. */
export function AvatarForm({ name, email, image }: AvatarFormProps) {
  const router = useRouter();
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

  // Keep header + portrait in sync after upload/remove
  useEffect(() => {
    if (uploadState.success || removeState.success) {
      router.refresh();
    }
  }, [uploadState.success, removeState.success, router]);

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
    <div className="flex w-full shrink-0 flex-col items-center gap-3 sm:items-start">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          onFilePicked(e.currentTarget.files?.[0]);
        }}
      />

      <div className="relative">
        {/* Soft amber bloom behind the portrait */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-3 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--amber)_28%,transparent),transparent_70%)] blur-md sm:-inset-5"
        />

        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          aria-label={image ? "Change photo" : "Upload photo"}
          className="group relative rounded-full outline-none transition-transform duration-300 ease-out active:scale-[0.98] hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-amber/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:opacity-60"
        >
          {/* Outer ring */}
          <span
            aria-hidden
            className="absolute -inset-1 rounded-full bg-linear-to-b from-cream/25 via-amber/20 to-cream/5 opacity-80 transition-opacity group-hover:opacity-100"
          />
          <UserAvatar
            name={name}
            email={email}
            image={image}
            size="xl"
            className="relative border-cream/10 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.85)] ring-1 ring-black/40"
          />
          {/* Always visible on touch; hover-reveal on fine pointers */}
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/50 opacity-100 backdrop-blur-[2px] transition-opacity duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:opacity-100">
            <Camera className="h-5 w-5 text-cream" strokeWidth={1.75} />
            <span className="text-[11px] font-medium tracking-wide text-cream/90">
              {uploading ? "Uploading…" : image ? "Edit" : "Add"}
            </span>
          </span>
        </button>
      </div>

      <div className="flex max-w-[16rem] flex-col items-center gap-1.5 text-center sm:max-w-none sm:items-start sm:text-left">
        {image ? (
          <form action={removeAction}>
            <button
              type="submit"
              disabled={busy}
              className="min-h-10 px-2 text-xs text-cream/35 transition-colors hover:text-cream/65 disabled:opacity-60 sm:min-h-0 sm:px-0"
            >
              {removing ? "Removing…" : "Remove photo"}
            </button>
          </form>
        ) : (
          <p className="text-xs text-cream/35">Tap the portrait to add a photo</p>
        )}

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
