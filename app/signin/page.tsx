import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignInForm } from "@/components/sign-in-form";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center px-6 pt-24 pb-16">
      <h1 className="font-display text-4xl tracking-wide text-cream sm:text-5xl">
        Sign in
      </h1>
      <p className="mt-2 max-w-md text-cream/60">
        Use the email and password you registered with.
      </p>
      <SignInForm />
    </main>
  );
}
