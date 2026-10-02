import Image from "next/image";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { px: 32, className: "h-8 w-8" },
  md: { px: 48, className: "h-12 w-12" },
  lg: { px: 80, className: "h-20 w-20" },
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
  const { px, className: sizeClass } = sizes[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/brand/logo-dark.jpg"
        alt={withWordmark ? "" : "FrameOne"}
        width={px}
        height={px}
        priority={priority}
        className={cn("rounded-sm object-cover", sizeClass)}
      />
      {withWordmark ? (
        <span className="font-display text-xl tracking-[0.2em] text-cream uppercase">
          FrameOne
        </span>
      ) : null}
    </span>
  );
}
