import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";
import { SignUpForm } from "@/components/sign-up-form";

export default async function SignUpPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_15%,color-mix(in_srgb,var(--amber)_12%,transparent),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_85%,color-mix(in_srgb,var(--stage)_90%,transparent),transparent_50%)]" />
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
          Join FrameOne
        </p>
        <h1 className="mt-3 font-display text-4xl leading-none tracking-wide text-cream sm:text-5xl">
          Sign up
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/55 sm:text-base">
          Save favorites, build a watchlist, and keep your ratings in one place.
        </p>

        <div className="mt-8 sm:mt-10">
          <SignUpForm />
        </div>
      </div>
    </main>
  );
}
