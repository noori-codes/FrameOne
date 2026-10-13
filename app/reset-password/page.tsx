import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthShell } from "@/components/auth-shell";
import { ResetPasswordForm } from "@/components/reset-password-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const session = await auth();
  if (session?.user) redirect("/");

  const { email: emailRaw } = await searchParams;
  const email = emailRaw?.trim().toLowerCase() ?? "";
  if (!email) redirect("/forgot-password");

  return (
    <AuthShell
      eyebrow="Almost done"
      title="Reset password"
      description={
        <>
          Enter the code we sent to{" "}
          <span className="text-cream/80">{email}</span>, then choose a new
          password.
        </>
      }
      panelLine="One code, a new password — then you’re back in."
    >
      <ResetPasswordForm email={email} />
    </AuthShell>
  );
}
