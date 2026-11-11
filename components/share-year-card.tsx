"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ShareYearCardProps = {
  year: number;
  watchedCount: number;
  avgRating: number | null;
  peakMonth: string | null;
  topTitle?: string | null;
  className?: string;
};

/**
 * One-tap share for the year-in-film moment (Web Share → clipboard fallback).
 */
export function ShareYearCard({
  year,
  watchedCount,
  avgRating,
  peakMonth,
  topTitle,
  className,
}: ShareYearCardProps) {
  const [copied, setCopied] = useState(false);

  const lines = [
    `My ${year} on FrameOne`,
    `${watchedCount} title${watchedCount === 1 ? "" : "s"} logged`,
    avgRating != null ? `${avgRating} avg score` : null,
    peakMonth ? `Peak month: ${peakMonth}` : null,
    topTitle ? `Standout: ${topTitle}` : null,
  ].filter(Boolean) as string[];

  const text = lines.join("\n");
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/stats?year=${year}`
      : `/stats?year=${year}`;

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `My ${year} on FrameOne`,
          text,
          url,
        });
        return;
      }
    } catch {
      // User cancelled or share failed — fall through to copy.
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-md border border-cream/15 bg-black/35 px-4 text-sm font-medium text-cream/80 backdrop-blur-md transition-[border-color,background-color,color] hover:border-amber/40 hover:bg-amber/10 hover:text-amber",
        className,
      )}
    >
      {copied ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Share2 className="size-4" aria-hidden />
      )}
      {copied ? "Copied" : "Share year"}
    </button>
  );
}
