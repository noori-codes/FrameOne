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
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center px-6 pt-24 pb-16">
      <BrandLogo size="md" className="mb-6" />
      <h1 className="font-display text-4xl tracking-wide text-cream sm:text-5xl">
        Sign in
      </h1>
      <p className="mt-2 max-w-md text-cream/60">
        Use the email and password you registered with.
      </p>
      <SignInForm callbackUrl={callbackUrl} />
    </main>
  );
}
