"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useOptimistic } from "react";
import { toggleList, type ToggleListState } from "@/app/actions/favorites";
import { LIST_FAVORITE, type MediaListType } from "@/lib/lists";
import { cn } from "@/lib/utils";

type FavoriteHeartProps = {
  movieId: number;
  title: string;
  posterPath: string | null;
  mediaType: MediaListType;
  initialFavorite?: boolean;
};

/**
 * Tiny client island — mount only for signed-in surfaces.
 */
export function FavoriteHeart({
  movieId,
  title,
  posterPath,
  mediaType,
  initialFavorite = false,
}: FavoriteHeartProps) {
  const router = useRouter();
  const [state, dispatch, pending] = useActionState(toggleList, {
    saved: initialFavorite,
    listType: LIST_FAVORITE,
  } satisfies ToggleListState);
  const saved = state.saved ?? initialFavorite;
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);
  const shownSaved = state.error && !pending ? saved : optimisticSaved;

  useEffect(() => {
    if (state.error?.toLowerCase().includes("sign in")) {
      const callback = encodeURIComponent(
        `${window.location.pathname}${window.location.search}`,
      );
      router.push(`/signin?callbackUrl=${callback}`);
    }
  }, [state.error, router]);

  function action(formData: FormData) {
    if (pending) return;
    setOptimisticSaved(!shownSaved);
    dispatch(formData);
  }

  return (
    <form action={action} onClick={(e) => e.stopPropagation()}>
      <input type="hidden" name="movieId" value={movieId} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="posterPath" value={posterPath ?? ""} />
      <input type="hidden" name="listType" value={LIST_FAVORITE} />
      <input type="hidden" name="mediaType" value={mediaType} />
      <button
        type="submit"
        aria-busy={pending}
        aria-label={shownSaved ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={shownSaved}
        className={cn(
          "movie-card-heart inline-flex size-7 items-center justify-center rounded-full border border-cream/10 bg-black/55 text-cream/85 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md will-change-transform",
          "transition-[opacity,transform,color,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "hover:border-red-400/35 hover:bg-black/75 hover:text-red-400 active:scale-95",
          shownSaved &&
            "border-red-400/40 text-red-500 shadow-[0_8px_22px_-10px_rgba(239,68,68,0.55)]",
        )}
      >
        <Heart
          className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          fill={shownSaved ? "currentColor" : "none"}
          strokeWidth={shownSaved ? 2.25 : 2}
          aria-hidden
        />
      </button>
    </form>
  );
}
