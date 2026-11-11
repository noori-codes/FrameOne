"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type DetailActionRailProps = {
  children: ReactNode;
  /** Accessible name when the rail is pinned. */
  label?: string;
};

/**
 * Keeps detail CTAs in the hero, then pins the same node to the bottom
 * once the hero actions leave the viewport — no duplicated forms.
 */
export function DetailActionRail({
  children,
  label = "Title actions",
}: DetailActionRailProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [railHeight, setRailHeight] = useState(0);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setPinned(!(entry?.isIntersecting ?? true));
      },
      {
        // Stay pinned until the original slot is clearly back on screen.
        rootMargin: "-64px 0px 0px 0px",
        threshold: 0,
      },
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    function measure() {
      setRailHeight(railRef.current?.offsetHeight ?? 0);
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(rail);
    return () => ro.disconnect();
  }, [pinned]);

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />
      {pinned ? (
        <div aria-hidden style={{ height: railHeight }} className="w-full" />
      ) : null}
      <div
        ref={railRef}
        aria-label={pinned ? label : undefined}
        className={cn(
          "transition-[background-color,box-shadow,border-color] duration-300",
          pinned &&
            "fixed inset-x-0 bottom-0 z-40 border-t border-cream/12 bg-background/92 px-4 py-3 shadow-[0_-24px_48px_-28px_rgba(0,0,0,0.95)] backdrop-blur-2xl pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-8",
        )}
      >
        <div
          className={cn(
            pinned && "mx-auto flex w-full max-w-6xl justify-start",
          )}
        >
          {children}
        </div>
      </div>
    </>
  );
}
