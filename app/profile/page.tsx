import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import {
  AvatarForm,
  ChangePasswordForm,
  UpdateNameForm,
} from "@/components/profile-forms";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  let session;
  try {
    session = await auth();
  } catch {
    redirect("/signin");
  }
  if (!session?.user?.id) redirect("/signin");

  let user: {
    email: string;
    name: string | null;
    image: string | null;
    createdAt: Date;
  } | null = null;

  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true, image: true, createdAt: true },
    });
  } catch (err) {
    console.error("Profile DB error:", err);
    redirect("/signin");
  }

  // Neon is empty / user was on old SQLite — kill the ghost session
  if (!user) {
    await signOut({ redirectTo: "/signup" });
  }

  // Old direct S3 URLs 403 in the browser — rewrite to the app proxy
  let image = user!.image;
  if (image && !image.startsWith("/api/avatars/")) {
    image = `/api/avatars/${session.user.id}?v=${Date.now()}`;
    await prisma.user
      .update({
        where: { id: session.user.id },
        data: { image },
      })
      .catch(() => undefined);
  }

  const memberSince = user!.createdAt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-16">
      <h1 className="text-3xl font-semibold tracking-tight text-cream sm:text-4xl md:text-5xl">
        Account
      </h1>
      <p className="mt-1.5 text-sm text-cream/60 sm:mt-2 sm:text-base">
        Manage your FrameOne account.
      </p>

      <section className="relative mt-8 overflow-hidden rounded-2xl sm:mt-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--amber)_14%,transparent),transparent_55%)] sm:bg-[radial-gradient(ellipse_at_20%_40%,color-mix(in_srgb,var(--amber)_12%,transparent),transparent_55%),linear-gradient(180deg,color-mix(in_srgb,var(--stage)_80%,transparent),transparent)]"
        />

        <div className="relative flex flex-col items-center gap-5 px-3 py-6 sm:flex-row sm:items-center sm:gap-8 sm:px-5 sm:py-8">
          <AvatarForm
            name={user!.name}
            email={user!.email}
            image={image}
          />

          <div className="min-w-0 w-full flex-1 space-y-2 text-center sm:w-auto sm:space-y-3 sm:text-left">
            <UpdateNameForm defaultName={user!.name ?? ""} />
            <p className="break-all text-sm text-cream/55 sm:truncate sm:break-normal">
              {user!.email}
            </p>
            <p className="text-xs text-cream/35 sm:text-sm">
              Member since {memberSince}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 border-t border-cream/10 pt-8 sm:mt-14 sm:pt-10">
        <h2 className="text-lg font-semibold tracking-tight text-cream sm:text-xl">
          Security
        </h2>
        <p className="mt-1 mb-5 text-sm text-cream/50 sm:mb-6">
          Enter your current password, then choose a new one (min 6 characters).
        </p>
        <ChangePasswordForm />
      </section>

      <div className="mt-10 border-t border-cream/10 pt-6 text-center sm:mt-14 sm:pt-8 sm:text-left">
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="min-h-11 px-2 text-sm text-cream/40 transition-colors hover:text-cream sm:min-h-0 sm:px-0"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
