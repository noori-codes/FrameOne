import Link from "next/link";
import type { ReactNode } from "react";
import { AuthCinematicPanel } from "@/components/auth-cinematic-panel";
import { BrandLogo } from "@/components/brand-logo";
import { getAuthScenes } from "@/lib/auth-posters";

type AuthShellProps = {
  /** Small label above the form title */
  eyebrow: string;
  /** Form-column heading */
  title: string;
  /** One supporting line under the form title */
  description: ReactNode;
  /** Brand-panel supporting line (left column) */
  panelLine: string;
  children: ReactNode;
};

/**
 * Split auth layout — cinematic stills + focused form column.
 * Used by sign-in, sign-up, and email verification.
 */
export async function AuthShell({
  eyebrow,
  title,
  description,
  panelLine,
  children,
}: AuthShellProps) {
  const scenes = await getAuthScenes();

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col lg:flex-row">
      <aside className="relative isolate hidden min-h-dvh w-full overflow-hidden lg:flex lg:w-[46%] xl:w-[48%]">
        <AuthCinematicPanel scenes={scenes} />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(165deg,rgba(7,10,11,0.28)_0%,rgba(7,10,11,0.55)_48%,rgba(7,10,11,0.88)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_28%_18%,color-mix(in_srgb,var(--amber)_14%,transparent),transparent_52%)]"
        />
        <div aria-hidden className="film-grain absolute inset-0 opacity-80" />

        <div className="relative z-10 flex w-full flex-col justify-between px-10 py-10 xl:px-14 xl:py-12">
          <Link
            href="/"
            className="auth-panel-line auth-panel-line-1 w-fit transition-opacity hover:opacity-90"
            aria-label="FrameOne home"
          >
            <BrandLogo size="md" priority />
          </Link>

          <div className="max-w-md pb-16 xl:pb-20">
            <p className="auth-panel-line auth-panel-line-2 font-display text-6xl leading-[0.92] tracking-[0.08em] text-amber uppercase xl:text-7xl">
              FrameOne
            </p>
            <p className="auth-panel-line auth-panel-line-3 mt-5 max-w-sm text-base leading-relaxed text-cream/70 xl:text-lg">
              {panelLine}
            </p>
          </div>
        </div>
      </aside>

      <section className="relative flex flex-1 flex-col overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,color-mix(in_srgb,var(--amber)_10%,transparent),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_100%,color-mix(in_srgb,var(--stage)_80%,transparent),transparent_45%)]" />
          <div className="film-grain absolute inset-0 opacity-60" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10 sm:px-8 sm:py-14 lg:max-w-lg lg:px-10 xl:px-12">
          <Link
            href="/"
            className="mb-8 inline-flex w-fit transition-opacity hover:opacity-90 lg:hidden"
            aria-label="FrameOne home"
          >
            <BrandLogo size="md" withWordmark priority />
          </Link>

          <p className="auth-form-line auth-form-line-1 text-xs tracking-[0.28em] text-amber/80 uppercase">
            {eyebrow}
          </p>
          <h1 className="auth-form-line auth-form-line-2 mt-3 font-display text-4xl leading-none tracking-wide text-cream sm:text-5xl">
            {title}
          </h1>
          <p className="auth-form-line auth-form-line-3 mt-3 max-w-sm text-sm leading-relaxed text-cream/55 sm:text-base">
            {description}
          </p>

          <div className="auth-form-line auth-form-line-4 mt-8 sm:mt-10">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
