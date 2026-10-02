import { Skeleton } from "@/components/skeletons";

export default function ProfileLoading() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-24 pb-16">
      <Skeleton className="h-10 w-36" />
      <Skeleton className="mt-2 h-4 w-56" />
      <Skeleton className="mt-10 h-4 w-64" />
      <Skeleton className="mt-12 h-8 w-40" />
      <Skeleton className="mt-6 h-10 w-full max-w-sm" />
      <Skeleton className="mt-4 h-9 w-28" />
    </main>
  );
}
