import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { posterUrl } from "@/lib/tmdb";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-24 pb-16">
      <h1 className="font-display text-4xl tracking-wide text-cream sm:text-5xl">
        My list
      </h1>
      <p className="mt-2 text-cream/60">
        Movies you saved — stored in your local database.
      </p>

      {favorites.length === 0 ? (
        <p className="mt-12 text-cream/50">
          Nothing here yet. Open a movie and tap{" "}
          <span className="text-cream/80">Add to my list</span>.
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {favorites.map((fav) => {
            const src = posterUrl(fav.posterPath);
            return (
              <li key={fav.id}>
                <Link
                  href={`/movie/${fav.movieId}`}
                  className="group block"
                >
                  <div className="relative aspect-2/3 overflow-hidden rounded-sm bg-stage ring-1 ring-cream/10 transition-[box-shadow,transform] group-hover:scale-[1.03] group-hover:ring-amber/50">
                    {src ? (
                      <Image
                        src={src}
                        alt={fav.title}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center p-2 text-center text-xs text-cream/40">
                        {fav.title}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-cream/70 group-hover:text-cream">
                    {fav.title}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
