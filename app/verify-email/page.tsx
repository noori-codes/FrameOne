import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthShell } from "@/components/auth-shell";
import { VerifyEmailForm } from "@/components/verify-email-form";

type VerifyEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const session = await auth();
  if (session?.user) redirect("/");

  const { email: emailRaw } = await searchParams;
  const email = emailRaw?.trim().toLowerCase() ?? "";
  if (!email) redirect("/signup");

  return (
    <AuthShell
      eyebrow="Almost there"
      title="Verify email"
      description={
        <>
          We sent a 6-digit code to{" "}
          <span className="text-cream/80">{email}</span>. Enter it below to
          unlock your account.
        </>
      }
      panelLine="One quick code — then your favorites and watchlist are ready to go."
    >
      <VerifyEmailForm email={email} />
    </AuthShell>
  );
}
