import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";
import { SignUpForm } from "@/components/sign-up-form";

export default async function SignUpPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center px-6 pt-24 pb-16">
      <BrandLogo size="md" className="mb-6" />
      <h1 className="font-display text-4xl tracking-wide text-cream sm:text-5xl">
        Sign up
      </h1>
      <p className="mt-2 max-w-md text-cream/60">
        Create an account — we store a hashed password, never plain text.
      </p>
      <SignUpForm />
    </main>
  );
}
