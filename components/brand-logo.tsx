import Image from "next/image";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { px: 32, className: "h-8 w-8", word: "h-8 text-xl" },
  md: { px: 48, className: "h-12 w-12", word: "h-12 text-2xl" },
  lg: { px: 80, className: "h-20 w-20", word: "h-20 text-4xl" },
} as const;

type BrandLogoProps = {
  size?: keyof typeof sizes;
  className?: string;
  /** Show “FrameOne” word next to the mark (header, etc.) */
  withWordmark?: boolean;
  priority?: boolean;
};

/**
 * Site brand mark — dark charcoal + gold F1 monogram.
 * Use on dark UI surfaces. For light surfaces, swap to /brand/logo-light.jpg later.
 */
export function BrandLogo({
  size = "sm",
  className,
  withWordmark = false,
  priority = false,
}: BrandLogoProps) {
  const { px, className: sizeClass, word } = sizes[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/brand/logo-dark.jpg"
        alt={withWordmark ? "" : "FrameOne"}
        width={px}
        height={px}
        priority={priority}
        className={cn("block shrink-0 rounded-sm object-cover", sizeClass)}
      />
      {withWordmark ? (
        <span
          className={cn(
            // Same height as the mark so both share one vertical center
            "inline-flex items-center font-display leading-none tracking-[0.2em] text-cream uppercase",
            // Bebas sits a hair high in the em-box — nudge to match the mark
            "translate-y-[0.06em]",
            word,
          )}
        >
          FrameOne
        </span>
      ) : null}
    </span>
  );
}
