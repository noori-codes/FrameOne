"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  useId,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export const authFieldClass =
  "auth-field w-full rounded-xl border border-cream/12 bg-cream/[0.035] px-4 py-3.5 text-[15px] text-cream outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-cream/22 focus:border-amber/55 focus:bg-cream/[0.055] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--amber)_18%,transparent),0_12px_40px_-24px_color-mix(in_srgb,var(--amber)_45%,transparent)]";

type AuthFieldProps = ComponentProps<"input"> & {
  label: ReactNode;
  hint?: ReactNode;
};

export function AuthField({
  label,
  hint,
  className,
  id,
  ...props
}: AuthFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <label className="group flex flex-col gap-2 text-sm text-cream/60">
      <span className="flex items-center justify-between gap-3 tracking-wide">
        <span className="transition-colors duration-300 group-focus-within:text-cream/85">
          {label}
        </span>
        {hint}
      </span>
      <input id={fieldId} className={cn(authFieldClass, className)} {...props} />
    </label>
  );
}

type AuthPasswordFieldProps = Omit<AuthFieldProps, "type"> & {
  autoComplete?: string;
};

export function AuthPasswordField({
  label,
  hint,
  className,
  id,
  ...props
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <label className="group flex flex-col gap-2 text-sm text-cream/60">
      <span className="flex items-center justify-between gap-3 tracking-wide">
        <span className="transition-colors duration-300 group-focus-within:text-cream/85">
          {label}
        </span>
        {hint}
      </span>
      <span className="relative">
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          className={cn(authFieldClass, "pr-12", className)}
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-cream/35 transition-colors hover:bg-cream/5 hover:text-cream/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50"
        >
          {visible ? (
            <EyeOff className="size-4" strokeWidth={1.75} />
          ) : (
            <Eye className="size-4" strokeWidth={1.75} />
          )}
        </button>
      </span>
    </label>
  );
}

type AuthSubmitButtonProps = {
  pending?: boolean;
  pendingLabel: string;
  children: ReactNode;
  className?: string;
};

export function AuthSubmitButton({
  pending,
  pendingLabel,
  children,
  className,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "auth-submit group relative mt-1 flex min-h-12 w-full items-center justify-center overflow-hidden rounded-full bg-amber px-5 py-3 text-sm font-semibold tracking-wide text-[color:var(--on-amber)] transition-[transform,background-color,box-shadow] duration-300 hover:bg-(--amber-dim) hover:text-cream hover:shadow-[0_16px_48px_-18px_color-mix(in_srgb,var(--amber)_70%,transparent)] active:scale-[0.985] disabled:pointer-events-none disabled:opacity-55",
        className,
      )}
    >
      <span className="auth-submit-shine pointer-events-none absolute inset-0" />
      <span className="relative inline-flex items-center gap-2">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" strokeWidth={2} />
            {pendingLabel}
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}

export function AuthStatus({ children }: { children: ReactNode }) {
  return (
    <p
      className="auth-banner rounded-xl border border-amber/25 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--amber)_14%,transparent),color-mix(in_srgb,var(--amber)_4%,transparent))] px-3.5 py-2.5 text-sm text-amber shadow-[0_12px_32px_-24px_color-mix(in_srgb,var(--amber)_55%,transparent)]"
      role="status"
    >
      {children}
    </p>
  );
}

export function AuthError({ children }: { children: ReactNode }) {
  return (
    <p
      className="auth-banner rounded-xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300"
      role="alert"
    >
      {children}
    </p>
  );
}

export function AuthFooterLink({
  prompt,
  href,
  label,
}: {
  prompt: string;
  href: string;
  label: string;
}) {
  return (
    <p className="text-center text-sm text-cream/40">
      {prompt}{" "}
      <Link
        href={href}
        className="font-medium text-cream/80 underline decoration-cream/20 underline-offset-4 transition-colors hover:text-amber hover:decoration-amber/50"
      >
        {label}
      </Link>
    </p>
  );
}
