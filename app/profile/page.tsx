import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  ChartColumn,
  Check,
  Heart,
  ListVideo,
  Lock,
  LogOut,
} from "lucide-react";
import { auth, signOut } from "@/auth";
import {
  AvatarForm,
  ChangePasswordForm,
  UpdateNameForm,
} from "@/components/profile-forms";
import { ProfileShelfStrip } from "@/components/profile-shelf-strip";
import { SiteFooter } from "@/components/site-footer";
import { LIST_FAVORITE, LIST_WATCHED, LIST_WATCHLIST } from "@/lib/lists";
import { prisma } from "@/lib/prisma";
import { posterUrl } from "@/lib/tmdb";

function SettingsPanel({
  eyebrow,
  title,
  description,
  icon,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-3xl border border-cream/10 bg-black/25 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-start gap-3.5 border-b border-cream/8 px-5 py-5 sm:px-6">
        <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-amber/25 bg-amber/10 text-amber">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-amber uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-1 font-display text-2xl tracking-wide text-cream uppercase sm:text-3xl">
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

  const [favorites, watchlist, watched, ratedCount] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId, listType: LIST_FAVORITE },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        movieId: true,
        title: true,
        posterPath: true,
        mediaType: true,
      },
    }),
    prisma.favorite.findMany({
      where: { userId, listType: LIST_WATCHLIST },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        movieId: true,
        title: true,
        posterPath: true,
        mediaType: true,
      },
    }),
    prisma.favorite.findMany({
      where: { userId, listType: LIST_WATCHED },
      orderBy: [{ watchedAt: "desc" }, { createdAt: "desc" }],
      take: 12,
      select: {
        id: true,
        movieId: true,
        title: true,
        posterPath: true,
        mediaType: true,
      },
    }),
    prisma.favorite.count({
      where: {
        userId,
        listType: LIST_FAVORITE,
        rating: { not: null },
      },
    }),
  ]);

  const [favoriteCount, watchlistCount, watchedCount] = await Promise.all([
    prisma.favorite.count({
      where: { userId, listType: LIST_FAVORITE },
    }),
    prisma.favorite.count({
      where: { userId, listType: LIST_WATCHLIST },
    }),
    prisma.favorite.count({
      where: { userId, listType: LIST_WATCHED },
    }),
  ]);

  const mosaic = [...favorites, ...watchlist, ...watched]
    .filter((item) => item.posterPath)
    .slice(0, 6)
    .map((item) => posterUrl(item.posterPath, "w500"))
    .filter((src): src is string => Boolean(src));

  const memberSince = user!.createdAt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

  const toShelf = (
    rows: {
      id: string;
      movieId: number;
      title: string;
      posterPath: string | null;
      mediaType: string;
    }[],
  ) =>
    rows.map((row) => ({
      id: row.id,
      movieId: row.movieId,
      title: row.title,
      posterPath: row.posterPath,
      mediaType: (row.mediaType === "tv" ? "tv" : "movie") as "tv" | "movie",
    }));

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-x-hidden bg-background">
      {/* Hero */}
      <header className="relative isolate overflow-hidden border-b border-cream/8">
        {mosaic.length > 0 ? (
          <div
            aria-hidden
            className="absolute inset-0 -z-20 flex items-center justify-center gap-3 opacity-35 blur-[2px] sm:gap-4"
          >
            {mosaic.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="relative aspect-2/3 w-[15%] max-w-40 min-w-20 overflow-hidden rounded-lg"
                style={{
                  transform: `translateY(${(i % 2 === 0 ? -1 : 1) * 10}%) rotate(${(i - 2.5) * 2.5}deg)`,
                }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  priority={i < 3}
                  sizes="160px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-b from-background/35 via-background/88 to-background"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--amber)_18%,transparent),transparent_55%)]"
        />
        <div className="film-grain absolute inset-0 -z-10" />

        <div className="relative w-full px-5 pt-10 pb-10 sm:px-8 sm:pt-12 sm:pb-12 lg:px-12 xl:px-16">
          <p className="text-center text-[10px] font-semibold tracking-[0.24em] text-amber uppercase lg:text-left">
            Your FrameOne
          </p>

          <div className="mt-8 flex flex-col items-center gap-8 lg:mt-10 lg:flex-row lg:items-center lg:gap-12 xl:gap-16">
            <AvatarForm
              name={user!.name}
              email={user!.email}
              image={image}
            />

            <div className="min-w-0 flex-1 space-y-5 text-center lg:text-left">
              <UpdateNameForm defaultName={user!.name ?? ""} />

              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-cream/50 lg:justify-start">
                <span className="break-all">{user!.email}</span>
                <span className="hidden text-cream/25 sm:inline" aria-hidden>
                  ·
                </span>
                <span>Member since {memberSince}</span>
              </div>

              <dl className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:justify-start">
                <Link
                  href="/favorites"
                  className="group min-w-[6.5rem] rounded-2xl border border-cream/10 bg-black/30 px-4 py-3 text-left backdrop-blur-md transition-[border-color,background-color] hover:border-amber/35 hover:bg-amber/5"
                >
                  <dt className="text-[10px] font-semibold tracking-[0.16em] text-cream/40 uppercase">
                    Favorites
                  </dt>
                  <dd className="mt-1 font-display text-3xl tracking-wide text-cream tabular-nums transition-colors group-hover:text-amber">
                    {favoriteCount}
                  </dd>
                </Link>
                <Link
                  href="/watchlist"
                  className="group min-w-[6.5rem] rounded-2xl border border-cream/10 bg-black/30 px-4 py-3 text-left backdrop-blur-md transition-[border-color,background-color] hover:border-amber/35 hover:bg-amber/5"
                >
                  <dt className="text-[10px] font-semibold tracking-[0.16em] text-cream/40 uppercase">
                    Watchlist
                  </dt>
                  <dd className="mt-1 font-display text-3xl tracking-wide text-cream tabular-nums transition-colors group-hover:text-amber">
                    {watchlistCount}
                  </dd>
                </Link>
                <Link
                  href="/watched"
                  className="group min-w-[6.5rem] rounded-2xl border border-cream/10 bg-black/30 px-4 py-3 text-left backdrop-blur-md transition-[border-color,background-color] hover:border-amber/35 hover:bg-amber/5"
                >
                  <dt className="text-[10px] font-semibold tracking-[0.16em] text-cream/40 uppercase">
                    Watched
                  </dt>
                  <dd className="mt-1 font-display text-3xl tracking-wide text-cream tabular-nums transition-colors group-hover:text-amber">
                    {watchedCount}
                  </dd>
                </Link>
                <div className="min-w-[6.5rem] rounded-2xl border border-cream/10 bg-black/30 px-4 py-3 text-left backdrop-blur-md">
                  <dt className="text-[10px] font-semibold tracking-[0.16em] text-cream/40 uppercase">
                    Rated
                  </dt>
                  <dd className="mt-1 font-display text-3xl tracking-wide text-cream tabular-nums">
                    {ratedCount}
                  </dd>
                </div>
                <Link
                  href="/stats"
                  className="group min-w-[6.5rem] rounded-2xl border border-cream/10 bg-black/30 px-4 py-3 text-left backdrop-blur-md transition-[border-color,background-color] hover:border-amber/35 hover:bg-amber/5"
                >
                  <dt className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-cream/40 uppercase">
                    <ChartColumn className="size-3 text-amber/80" aria-hidden />
                    Stats
                  </dt>
                  <dd className="mt-1 font-display text-2xl tracking-wide text-cream transition-colors group-hover:text-amber sm:text-3xl">
                    Year
                  </dd>
                </Link>
              </dl>
            </div>
          </div>
        </div>
      </header>

      {/* Shelves */}
      <div className="relative w-full space-y-12 px-5 py-10 sm:space-y-14 sm:px-8 sm:py-12 lg:px-12 xl:px-16">
        <ProfileShelfStrip
          title="Favorites"
          href="/favorites"
          count={favoriteCount}
          emptyLabel="No favorites yet"
          items={toShelf(favorites)}
        />
        <ProfileShelfStrip
          title="Watchlist"
          href="/watchlist"
          count={watchlistCount}
          emptyLabel="Watchlist is empty"
          items={toShelf(watchlist)}
        />
        <ProfileShelfStrip
          title="Watched"
          href="/watched"
          count={watchedCount}
          emptyLabel="Nothing logged yet"
          items={toShelf(watched)}
        />
      </div>

      {/* Settings */}
      <div className="relative w-full border-t border-cream/8 px-5 py-10 sm:px-8 sm:py-12 lg:px-12 xl:px-16">
        <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase">
          Settings
        </p>
        <h2 className="mt-2 font-display text-3xl tracking-wide text-cream uppercase sm:text-4xl">
          Account
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          <SettingsPanel
            eyebrow="Security"
            title="Password"
            description="Keep your seat locked. Minimum 6 characters."
            icon={<Lock className="size-4" aria-hidden />}
          >
            <ChangePasswordForm />
          </SettingsPanel>

          <SettingsPanel
            eyebrow="Session"
            title="Sign out"
            description="End this session on this device. Your lists stay saved."
            icon={<LogOut className="size-4" aria-hidden />}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/favorites"
                  className="inline-flex items-center gap-2 rounded-full border border-cream/12 bg-black/25 px-3.5 py-2 text-xs text-cream/60 transition-colors hover:border-amber/35 hover:text-amber"
                >
                  <Heart className="size-3.5" aria-hidden />
                  Favorites
                </Link>
                <Link
                  href="/watchlist"
                  className="inline-flex items-center gap-2 rounded-full border border-cream/12 bg-black/25 px-3.5 py-2 text-xs text-cream/60 transition-colors hover:border-amber/35 hover:text-amber"
                >
                  <ListVideo className="size-3.5" aria-hidden />
                  Watchlist
                </Link>
                <Link
                  href="/watched"
                  className="inline-flex items-center gap-2 rounded-full border border-cream/12 bg-black/25 px-3.5 py-2 text-xs text-cream/60 transition-colors hover:border-amber/35 hover:text-amber"
                >
                  <Check className="size-3.5" aria-hidden />
                  Watched
                </Link>
              </div>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-cream/15 bg-black/30 px-5 text-sm text-cream/75 transition-colors hover:border-red-400/45 hover:bg-red-500/10 hover:text-red-300 sm:w-fit"
                >
                  <LogOut className="size-4" aria-hidden />
                  Sign out of FrameOne
                </button>
              </form>
            </div>
          </SettingsPanel>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
