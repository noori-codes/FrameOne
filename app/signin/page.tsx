import { AuthShell } from "@/components/auth-shell";
import { SignInForm } from "@/components/sign-in-form";

type SignInPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    verified?: string;
    reset?: string;
  }>;
};

/**
 * Sign-in. Middleware already redirects logged-in users away from this page.
 * `callbackUrl` is set by middleware when protecting /favorites or /profile.
 */
export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl: raw, verified, reset } = await searchParams;
  const callbackUrl =
    typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")
      ? raw
      : "/";

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      description="Pick up where you left off — favorites, watchlist, and your account."
      panelLine="Save what you love. Rate what you’ve seen. Pick up your list on any screen."
    >
      <SignInForm
        callbackUrl={callbackUrl}
        verified={verified === "1"}
        reset={reset === "1"}
      />
    </AuthShell>
  );
}
