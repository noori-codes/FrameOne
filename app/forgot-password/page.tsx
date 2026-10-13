import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Forgot password"
      description="Enter the email on your account. We’ll send a 6-digit code if it matches a verified FrameOne login."
      panelLine="Locked out? Reset in a minute and get back to your list."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
