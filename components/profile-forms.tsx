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
import { Camera, Pencil } from "lucide-react";
import { AvatarCropModal } from "@/components/avatar-crop-modal";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

const nameInitial: ProfileFormState = {};
const passwordInitial: ProfileFormState = {};
const avatarInitial: ProfileFormState = {};

const fieldClass =
  "w-full rounded-xl border border-cream/12 bg-black/35 px-4 py-3 text-sm text-cream outline-none transition-[border-color,background-color,box-shadow] placeholder:text-cream/30 focus:border-amber/45 focus:bg-black/50 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--amber)_12%,transparent)]";

/** Display name as hero text with an inline edit control. */
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
      <div className="flex flex-wrap items-end justify-center gap-x-3 gap-y-2 lg:justify-start">
        <h2 className="max-w-full font-display text-4xl leading-[0.9] tracking-tight text-cream wrap-break-word sm:text-5xl lg:text-6xl">
          {defaultName.trim() || (
            <span className="font-display text-cream/35">No display name</span>
          )}
        </h2>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mb-1 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-cream/12 bg-black/30 px-3 py-1.5 text-xs font-medium tracking-wide text-cream/55 backdrop-blur-md transition-colors hover:border-amber/40 hover:text-amber sm:min-h-0"
        >
          <Pencil className="size-3" aria-hidden />
          Edit
        </button>
        {state.success ? (
          <p className="basis-full text-sm text-amber lg:text-left" role="status">
            {state.success}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      action={action}
      className="mx-auto flex w-full max-w-md flex-col gap-3 lg:mx-0"
    >
      <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.18em] text-cream/45 uppercase">
        Display name
        <input
          name="name"
          type="text"
          defaultValue={defaultName}
          autoComplete="name"
          autoFocus
          className={cn(fieldClass, "normal-case tracking-normal")}
        />
      </label>
      {state.error ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
        <button
          type="submit"
          disabled={pending}
          className="cta-shine relative min-h-11 overflow-hidden rounded-full bg-amber px-5 py-2 text-sm font-semibold text-[color:var(--on-amber)] transition-colors hover:bg-(--amber-dim) hover:text-cream disabled:opacity-60 sm:min-h-0"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setEditing(false)}
          className="min-h-11 rounded-full px-4 py-2 text-sm text-cream/50 transition-colors hover:text-cream disabled:opacity-60 sm:min-h-0"
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
      <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.18em] text-cream/45 uppercase">
        Current password
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={cn(fieldClass, "normal-case tracking-normal")}
        />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.18em] text-cream/45 uppercase">
          New password
          <input
            name="newPassword"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={cn(fieldClass, "normal-case tracking-normal")}
          />
        </label>
        <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.18em] text-cream/45 uppercase">
          Confirm new
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={cn(fieldClass, "normal-case tracking-normal")}
          />
        </label>
      </div>
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
        className="cta-shine relative min-h-11 w-full overflow-hidden rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-[color:var(--on-amber)] transition-colors hover:bg-(--amber-dim) hover:text-cream disabled:opacity-60 sm:w-fit"
      >
        {pending ? "Updating…" : "Update password"}
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
    <div className="flex w-auto shrink-0 flex-col items-center gap-3">
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
        aria-label={image ? "Change photo" : "Upload photo"}
        className="group relative isolate size-32 shrink-0 rounded-full outline-none transition-transform duration-500 ease-out hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-amber/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background active:scale-[0.98] disabled:opacity-60 sm:size-40 lg:size-44"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 scale-[1.18] rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--amber)_38%,transparent),transparent_68%)] blur-xl"
        />
        <UserAvatar
          name={name}
          email={email}
          image={image}
          size="xl"
          className="relative z-10 h-full w-full border border-cream/20 text-4xl shadow-[0_20px_50px_-16px_rgba(0,0,0,0.9),inset_0_0_0_1px_rgba(0,0,0,0.35)] sm:text-5xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-15 rounded-full ring-1 ring-inset ring-cream/20 transition-[box-shadow,opacity] duration-500 group-hover:ring-amber/40 group-hover:shadow-[0_0_0_6px_color-mix(in_srgb,var(--amber)_12%,transparent)]"
        />
        <span className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1.5 rounded-full bg-black/55 opacity-100 backdrop-blur-[2px] transition-opacity duration-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:opacity-100">
          <Camera className="size-5 text-cream sm:size-6" strokeWidth={1.75} />
          <span className="text-[11px] font-medium tracking-wide text-cream/90 sm:text-xs">
            {uploading ? "Uploading…" : image ? "Edit" : "Add photo"}
          </span>
        </span>
      </button>

      <div className="flex max-w-[14rem] flex-col items-center gap-1.5 text-center">
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
          <p className="text-xs text-cream/35">Tap to add a portrait</p>
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
