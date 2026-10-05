import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import {
  AvatarForm,
  ChangePasswordForm,
  UpdateNameForm,
} from "@/components/profile-forms";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, image: true, createdAt: true },
  });

  if (!user) redirect("/signin");

  const memberSince = user.createdAt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-xl flex-col px-6 pt-8 pb-16">
      <h1 className="text-4xl font-semibold tracking-tight text-cream sm:text-5xl">
        Account
      </h1>
      <p className="mt-2 text-cream/60">Manage your FrameOne account.</p>

      {/* You — identity hero */}
      <section className="relative mt-10 overflow-hidden rounded-2xl">
        {/* Stage wash behind the portrait */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,color-mix(in_srgb,var(--amber)_12%,transparent),transparent_55%),linear-gradient(180deg,color-mix(in_srgb,var(--stage)_80%,transparent),transparent)]"
        />

        <div className="relative flex flex-col items-center gap-6 px-2 py-6 sm:flex-row sm:items-center sm:gap-8 sm:px-4 sm:py-8">
          <AvatarForm
            name={user.name}
            email={user.email}
            image={user.image}
          />

          <div className="min-w-0 flex-1 space-y-2 text-center sm:space-y-3 sm:text-left">
            <UpdateNameForm defaultName={user.name ?? ""} />
            <p className="truncate text-sm text-cream/55">{user.email}</p>
            <p className="text-sm text-cream/35">Member since {memberSince}</p>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="mt-14 border-t border-cream/10 pt-10">
        <h2 className="text-xl font-semibold tracking-tight text-cream">
          Security
        </h2>
        <p className="mt-1 mb-6 text-sm text-cream/50">
          Enter your current password, then choose a new one (min 6 characters).
        </p>
        <ChangePasswordForm />
      </section>

      {/* Quiet session action */}
      <div className="mt-14 border-t border-cream/10 pt-8">
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="text-sm text-cream/40 transition-colors hover:text-cream"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
