import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { SignInForm } from "@/components/sign-in-form";

type SignInPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

/**
 * Sign-in. Middleware already redirects logged-in users away from this page.
 * `callbackUrl` is set by middleware when protecting /favorites or /profile.
 */
export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl: raw } = await searchParams;
  const callbackUrl =
    typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")
      ? raw
      : "/";

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-hidden">
      {/* Stage atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_srgb,var(--amber)_14%,transparent),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_90%,color-mix(in_srgb,var(--stage)_90%,transparent),transparent_50%)]" />
        <div className="film-grain absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/"
          className="mb-10 inline-flex w-fit transition-opacity hover:opacity-90"
          aria-label="FrameOne home"
        >
          <BrandLogo size="md" withWordmark />
        </Link>

        <p className="text-xs tracking-[0.28em] text-amber/75 uppercase">
          Welcome back
        </p>
        <h1 className="mt-3 font-display text-4xl leading-none tracking-wide text-cream sm:text-5xl">
          Sign in
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/55 sm:text-base">
          Pick up where you left off — favorites, watchlist, and your account.
        </p>

        <div className="mt-8 sm:mt-10">
          <SignInForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </main>
  );
}
