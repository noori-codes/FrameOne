import { Skeleton } from "@/components/skeletons";

export default function GenresLoading() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-24 pb-16">
      <Skeleton className="h-10 w-36" />
      <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 16 }).map((_, i) => (
          <li key={i}>
            <Skeleton className="h-12 w-full" />
          </li>
        ))}
      </ul>
    </main>
  );
}
