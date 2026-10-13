import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Heart,
  ListVideo,
  Lock,
  LogOut,
  Sparkles,
  UserRound,
} from "lucide-react";
import { auth, signOut } from "@/auth";
import {
  AvatarForm,
  ChangePasswordForm,
  UpdateNameForm,
} from "@/components/profile-forms";
import { SiteFooter } from "@/components/site-footer";
import { LIST_FAVORITE, LIST_WATCHLIST } from "@/lib/lists";
import { prisma } from "@/lib/prisma";

function SettingsCard({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-sm border border-cream/10 bg-[linear-gradient(165deg,rgba(16,22,23,0.92),rgba(7,10,11,0.55))] shadow-[0_24px_60px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-start gap-3 border-b border-cream/10 px-5 py-4 sm:px-6 sm:py-5">
        <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-amber/25 bg-amber/10 text-amber">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-amber uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-1 font-display text-2xl uppercase tracking-wide text-cream sm:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-cream/50">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

function LibraryLink({
  href,
  label,
  count,
  blurb,
  icon,
}: {
  href: string;
  label: string;
  count: number;
  blurb: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-sm border border-cream/10 bg-black/25 px-4 py-4 transition-[border-color,background-color,transform] duration-300 hover:border-amber/35 hover:bg-amber/5 active:scale-[0.99]"
    >
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-cream/15 bg-stage text-amber transition-colors group-hover:border-amber/40">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="font-medium text-cream transition-colors group-hover:text-amber">
            {label}
          </span>
          <span className="text-xs tabular-nums text-cream/40">{count}</span>
        </span>
        <span className="mt-0.5 block text-xs text-cream/45">{blurb}</span>
      </span>
      <ArrowUpRight
        className="size-4 shrink-0 text-cream/30 transition-colors group-hover:text-amber"
        aria-hidden
      />
    </Link>
  );
}

export default async function ProfilePage() {
  let session;
  try {
    session = await auth();
  } catch {
    redirect("/signin");
  }
  if (!session?.user?.id) redirect("/signin");

  const userId = session.user.id;

  let user: {
    email: string;
    name: string | null;
    image: string | null;
    createdAt: Date;
  } | null = null;

  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, image: true, createdAt: true },
    });
  } catch (err) {
    console.error("Profile DB error:", err);
    redirect("/signin");
  }

  if (!user) {
    await signOut({ redirectTo: "/signup" });
  }

  let image = user!.image;
  if (image && !image.startsWith("/api/avatars/")) {
    image = `/api/avatars/${userId}?v=${Date.now()}`;
    await prisma.user
      .update({
        where: { id: userId },
        data: { image },
      })
      .catch(() => undefined);
  }

  const [favoriteCount, watchlistCount] = await Promise.all([
    prisma.favorite.count({
      where: { userId, listType: LIST_FAVORITE },
    }),
    prisma.favorite.count({
      where: { userId, listType: LIST_WATCHLIST },
    }),
  ]);

  const memberSince = user!.createdAt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const displayName = user!.name?.trim() || "Member";

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-x-hidden">
      <section className="relative isolate overflow-hidden border-b border-cream/10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_0%,rgba(229,37,53,0.18),transparent_45%),radial-gradient(ellipse_at_90%_20%,rgba(229,37,53,0.08),transparent_40%),linear-gradient(180deg,#101617_0%,#070a0b_100%)]"
        />
        <div className="film-grain absolute inset-0" />

        <div className="relative mx-auto w-full max-w-screen-2xl px-4 pt-14 pb-10 sm:px-6 sm:pt-16 sm:pb-12 lg:px-8 lg:pb-14">
          <p className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] text-amber uppercase sm:text-xs">
            <Sparkles className="size-3.5" aria-hidden />
            Your FrameOne
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[0.9] uppercase tracking-wide text-cream sm:text-6xl md:text-7xl">
            Account
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/55 sm:text-base">
            Portrait, security, and the lists that make this seat yours.
          </p>

          <div className="mt-8 grid grid-cols-1 items-center gap-8 sm:mt-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-12">
            <AvatarForm
              name={user!.name}
              email={user!.email}
              image={image}
            />

            <div className="min-w-0 space-y-4 text-center lg:text-left">
              <UpdateNameForm defaultName={user!.name ?? ""} />
              <p className="break-all text-sm text-cream/50 sm:break-normal lg:truncate">
                {user!.email}
              </p>

              <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                <span className="inline-flex items-center gap-2 rounded-full border border-cream/12 bg-black/30 px-3 py-1.5 text-xs text-cream/70 backdrop-blur-sm">
                  <Heart className="size-3.5 text-red-500" aria-hidden />
                  {favoriteCount} favorite{favoriteCount === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-cream/12 bg-black/30 px-3 py-1.5 text-xs text-cream/70 backdrop-blur-sm">
                  <ListVideo className="size-3.5 text-amber" aria-hidden />
                  {watchlistCount} on watchlist
                </span>
                <span className="inline-flex items-center rounded-full border border-cream/12 bg-black/30 px-3 py-1.5 text-xs text-cream/45 backdrop-blur-sm">
                  Since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto w-full max-w-screen-2xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <SettingsCard
            eyebrow="Collection"
            title="Your library"
            description="Jump straight into what you’ve saved."
            icon={<ListVideo className="size-4" aria-hidden />}
          >
            <div className="flex flex-col gap-3">
              <LibraryLink
                href="/favorites"
                label="Favorites"
                count={favoriteCount}
                blurb="Rated & noted titles you love"
                icon={<Heart className="size-4" aria-hidden />}
              />
              <LibraryLink
                href="/watchlist"
                label="Watchlist"
                count={watchlistCount}
                blurb="Up next on your queue"
                icon={<ListVideo className="size-4" aria-hidden />}
              />
            </div>
          </SettingsCard>

          <SettingsCard
            eyebrow="Identity"
            title="Profile"
            description="How you show up across FrameOne."
            icon={<UserRound className="size-4" aria-hidden />}
          >
            <dl className="space-y-0">
              <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 border-b border-cream/10 py-3.5 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
                <dt className="text-[11px] font-semibold tracking-[0.16em] text-cream/40 uppercase">
                  Name
                </dt>
                <dd className="min-w-0 text-sm text-cream/85">{displayName}</dd>
              </div>
              <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 border-b border-cream/10 py-3.5 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
                <dt className="text-[11px] font-semibold tracking-[0.16em] text-cream/40 uppercase">
                  Email
                </dt>
                <dd className="min-w-0 break-all text-sm text-cream/85">
                  {user!.email}
                </dd>
              </div>
              <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 py-3.5 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
                <dt className="text-[11px] font-semibold tracking-[0.16em] text-cream/40 uppercase">
                  Member
                </dt>
                <dd className="min-w-0 text-sm text-cream/85">{memberSince}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-cream/40">
              Edit your display name above the portrait. Email is your sign-in
              and can’t be changed here.
            </p>
          </SettingsCard>

          <SettingsCard
            eyebrow="Security"
            title="Password"
            description="Keep your seat locked. Minimum 6 characters."
            icon={<Lock className="size-4" aria-hidden />}
          >
            <ChangePasswordForm />
          </SettingsCard>

          <SettingsCard
            eyebrow="Session"
            title="Sign out"
            description="End this session on this device."
            icon={<LogOut className="size-4" aria-hidden />}
          >
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-cream/20 bg-black/30 px-5 text-sm text-cream/80 transition-colors hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300 sm:w-fit"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out of FrameOne
              </button>
            </form>
          </SettingsCard>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
