import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthShell } from "@/components/auth-shell";
import { SignUpForm } from "@/components/sign-up-form";

export default async function SignUpPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <AuthShell
      eyebrow="Join FrameOne"
      title="Sign up"
      description="Create an account to save favorites, build a watchlist, and keep your ratings."
      panelLine="Your cinema, organized — favorites, watchlist, and ratings in one place."
    >
      <SignUpForm />
    </AuthShell>
  );
}
