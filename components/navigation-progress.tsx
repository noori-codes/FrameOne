"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

function isModifiedClick(event: MouseEvent | PointerEvent) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    ("button" in event && event.button !== 0)
  );
}

function sameDestination(href: string, pathname: string, search: string) {
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return true;
    return url.pathname === pathname && url.search === search;
  } catch {
    return true;
  }
}

function resolveNavHref(
  event: Event,
  pathname: string,
  search: string,
): string | null {
  if (isModifiedClick(event as PointerEvent)) return null;
  if ((event as Event & { defaultPrevented?: boolean }).defaultPrevented) {
    return null;
  }
  const target = event.target;
  if (!(target instanceof Element)) return null;

  const anchor = target.closest("a");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:")) return null;
  if (href.startsWith("http") || href.startsWith("//")) {
    try {
      if (new URL(href, window.location.origin).origin !== window.location.origin) {
        return null;
      }
    } catch {
      return null;
    }
  }
  if (!href.startsWith("/") && !href.startsWith("http")) return null;
  if (sameDestination(href, pathname, search)) return null;
  return href;
}

/**
 * Instant click feedback for App Router navigations.
 * Arms on pointerdown (before click / loading.tsx), clears on route change.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const [active, setActive] = useState(false);
  const clearTimer = useRef<number | null>(null);
  const armed = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    setActive(false);
    armed.current = false;
    if (clearTimer.current != null) {
      window.clearTimeout(clearTimer.current);
      clearTimer.current = null;
    }
  }, [pathname, search]);

  useEffect(() => {
    function arm(href: string, x: number, y: number) {
      armed.current = true;
      start.current = { x, y };
      setActive(true);
      if (clearTimer.current != null) window.clearTimeout(clearTimer.current);
      clearTimer.current = window.setTimeout(() => {
        setActive(false);
        armed.current = false;
      }, 12_000);
      void href;
    }

    function disarm() {
      if (!armed.current) return;
      armed.current = false;
      setActive(false);
      if (clearTimer.current != null) {
        window.clearTimeout(clearTimer.current);
        clearTimer.current = null;
      }
    }

    function onPointerDown(event: PointerEvent) {
      const href = resolveNavHref(event, pathname, search);
      if (!href) return;
      arm(href, event.clientX, event.clientY);
    }

    function onPointerMove(event: PointerEvent) {
      if (!armed.current) return;
      const dx = event.clientX - start.current.x;
      const dy = event.clientY - start.current.y;
      if (Math.hypot(dx, dy) > 12) disarm();
    }

    function onPointerCancel() {
      disarm();
    }

    function onClick(event: MouseEvent) {
      // Keep armed through a real navigation click; disarm cancelled ones.
      if (!armed.current) {
        const href = resolveNavHref(event, pathname, search);
        if (href) arm(href, event.clientX, event.clientY);
        return;
      }
      if (event.defaultPrevented || isModifiedClick(event)) disarm();
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointercancel", onPointerCancel, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("pointercancel", onPointerCancel, true);
      document.removeEventListener("click", onClick, true);
      if (clearTimer.current != null) window.clearTimeout(clearTimer.current);
    };
  }, [pathname, search]);

  if (!mounted) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden",
        active ? "opacity-100" : "opacity-0 transition-opacity duration-200",
      )}
    >
      <div
        className={cn(
          "h-full w-full origin-left bg-amber shadow-[0_0_14px_3px_color-mix(in_srgb,var(--amber)_60%,transparent)]",
          active && "nav-progress-bar",
        )}
      />
    </div>
  );
}
