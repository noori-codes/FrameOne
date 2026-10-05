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

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-8 pb-16">
      <h1 className="text-4xl font-semibold tracking-tight text-cream sm:text-5xl">
        Profile
      </h1>
      <p className="mt-2 text-cream/60">Manage your FrameOne account.</p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight text-cream">
          Photo
        </h2>
        <p className="mt-1 mb-6 text-sm text-cream/50">
          Shown in the header and on your profile.
        </p>
        <AvatarForm name={user.name} email={user.email} image={user.image} />
      </section>

      <dl className="mt-12 space-y-2 border-t border-cream/10 pt-8 text-sm">
        <div className="flex flex-wrap gap-x-3">
          <dt className="text-cream/40">Email</dt>
          <dd className="text-cream/80">{user.email}</dd>
        </div>
        <div className="flex flex-wrap gap-x-3">
          <dt className="text-cream/40">Member since</dt>
          <dd className="text-cream/80">
            {user.createdAt.toLocaleDateString()}
          </dd>
        </div>
      </dl>

      <section className="mt-12 border-t border-cream/10 pt-8">
        <h2 className="text-xl font-semibold tracking-tight text-cream">
          Display name
        </h2>
        <p className="mt-1 mb-6 text-sm text-cream/50">
          Shown on the home welcome message when set.
        </p>
        <UpdateNameForm defaultName={user.name ?? ""} />
      </section>

      <section className="mt-12 border-t border-cream/10 pt-8">
        <h2 className="text-xl font-semibold tracking-tight text-cream">
          Password
        </h2>
        <p className="mt-1 mb-6 text-sm text-cream/50">
          Enter your current password, then choose a new one (min 6 characters).
        </p>
        <ChangePasswordForm />
      </section>

      <section className="mt-12 border-t border-cream/10 pt-8">
        <h2 className="text-xl font-semibold tracking-tight text-cream">
          Session
        </h2>
        <p className="mt-1 mb-6 text-sm text-cream/50">
          Sign out of FrameOne on this device.
        </p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded-full border border-cream/25 px-4 py-2 text-sm text-cream transition-colors hover:border-amber hover:text-amber"
          >
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
