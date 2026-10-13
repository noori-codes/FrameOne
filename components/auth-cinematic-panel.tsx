"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { AuthScene } from "@/lib/auth-posters";
import { cn } from "@/lib/utils";

const HOLD_MS = 6500;

type AuthCinematicPanelProps = {
  scenes: AuthScene[];
};

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new window.Image();
    img.decoding = "async";
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

/**
 * Full-bleed backdrops with slow crossfade + ken burns.
 * Images cache in order (1st → 2nd → 3rd…); rotation only uses ready slides.
 * Pauses while the tab is hidden so timers don’t catch up and rush slides.
 */
export function AuthCinematicPanel({ scenes }: AuthCinematicPanelProps) {
  const [index, setIndex] = useState(0);
  /** Inclusive index of the last scene that finished downloading. */
  const [readyThrough, setReadyThrough] = useState(-1);
  const readyThroughRef = useRef(readyThrough);
  readyThroughRef.current = readyThrough;

  useEffect(() => {
    if (scenes.length === 0) return;

    let cancelled = false;

    (async () => {
      for (let i = 0; i < scenes.length; i++) {
        if (cancelled) return;
        await preloadImage(scenes[i]!.src);
        if (cancelled) return;
        setReadyThrough(i);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [scenes]);

  useEffect(() => {
    if (scenes.length < 2) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const advance = () => {
      const max = readyThroughRef.current;
      if (max < 1) return;
      setIndex((current) => (current >= max ? 0 : current + 1));
    };

    const stop = () => {
      if (intervalId != null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const start = () => {
      if (intervalId != null) return;
      if (readyThroughRef.current < 1) return;
      if (document.visibilityState === "hidden") return;
      // Fresh full hold after resume — never dump queued ticks
      intervalId = setInterval(advance, HOLD_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        stop();
      } else {
        start();
      }
    };

    // Wait until two slides are cached, then start once (don’t restart per cache step)
    const bootId = window.setInterval(() => {
      if (readyThroughRef.current >= 1) {
        window.clearInterval(bootId);
        start();
      }
    }, 250);

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(bootId);
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [scenes.length]);

  if (scenes.length === 0) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_25%,color-mix(in_srgb,var(--amber)_20%,transparent),transparent_55%)]"
      />
    );
  }

  const visibleThrough = Math.max(readyThrough, 0);
  const activeIndex = Math.min(index, visibleThrough);
  const nextIndex =
    readyThrough >= 1
      ? activeIndex >= readyThrough
        ? 0
        : activeIndex + 1
      : -1;

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-background">
      {scenes.map((scene, i) => {
        if (i > readyThrough) return null;

        const isActive = i === activeIndex;
        const isNext = i === nextIndex;
        if (!isActive && !isNext && i !== 0) return null;

        return (
          <div
            key={scene.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              isActive ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={scene.src}
              alt=""
              fill
              sizes="(max-width: 1024px) 0px, 50vw"
              priority={i === 0}
              className={cn(
                "object-cover object-center",
                isActive &&
                  (i % 2 === 0 ? "auth-scene-zoom-a" : "auth-scene-zoom-b"),
              )}
            />
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-background/65 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-background via-background/55 to-transparent" />
    </div>
  );
}
