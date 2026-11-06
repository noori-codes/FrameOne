import Image from "next/image";
import Link from "next/link";
import { Clapperboard } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ListPageNav } from "@/components/list-page-nav";
import { MovieCard } from "@/components/movie-card";
import { LIST_WATCHLIST } from "@/lib/lists";
import { prisma } from "@/lib/prisma";
import { posterUrl } from "@/lib/tmdb";

export default async function WatchlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const items = await prisma.favorite.findMany({
    where: { userId: session.user.id, listType: LIST_WATCHLIST },
    orderBy: { createdAt: "desc" },
  });

  const cover =
    posterUrl(
      items.find((item) => item.posterPath)?.posterPath ?? null,
      "w780",
    ) ?? null;

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col bg-background">
      <header className="relative isolate overflow-hidden border-b border-cream/8">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 -z-20 object-cover object-[center_20%] opacity-35"
          />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-b from-background/50 via-background/85 to-background"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--amber)_14%,transparent),transparent_55%)]"
        />

        <div className="relative flex w-full flex-col gap-6 px-5 pt-8 pb-7 sm:px-8 sm:pt-10 sm:pb-9 lg:flex-row lg:items-end lg:justify-between lg:px-12 xl:px-16">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase">
              Up next
            </p>
            <h1 className="mt-2 font-display text-5xl leading-[0.9] tracking-wide text-cream uppercase sm:text-6xl lg:text-7xl">
              Watchlist
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream/60">
              {items.length === 0
                ? "Titles you want to watch later — separate from favorites."
                : `${items.length} ${items.length === 1 ? "title" : "titles"} queued up`}
            </p>
          </div>
          <ListPageNav active="watchlist" />
        </div>
      </header>

      <div className="relative w-full flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
        {items.length === 0 ? (
          <section className="flex min-h-[45vh] flex-col items-center justify-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full border border-amber/25 bg-amber/10 text-amber">
              <Clapperboard className="size-6" aria-hidden />
            </div>
            <h2 className="mt-6 font-display text-3xl tracking-wide text-cream uppercase sm:text-4xl">
              Watchlist is empty
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cream/50">
              Open a title and tap{" "}
              <span className="text-cream/75">Add to watchlist</span>.
            </p>
            <Link
              href="/search"
              className="cta-shine group relative mt-8 inline-flex overflow-hidden rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-[color:var(--on-amber)] transition-[background-color,box-shadow] hover:bg-(--amber-dim) hover:text-cream"
            >
              Browse titles
            </Link>
          </section>
        ) : (
          <ul className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {items.map((item, i) => (
              <li key={item.id}>
                <MovieCard
                  id={item.movieId}
                  title={item.title}
                  posterPath={item.posterPath}
                  mediaType={item.mediaType === "tv" ? "tv" : "movie"}
                  showTitle
                  showMediaBadge
                  priority={i < 6}
                  sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, (max-width: 1280px) 16vw, 12vw"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
