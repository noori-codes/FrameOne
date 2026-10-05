import Image from "next/image";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  sm: { px: 32, className: "h-8 w-8 text-sm" },
  md: { px: 64, className: "h-16 w-16 text-xl" },
  lg: { px: 96, className: "h-24 w-24 text-3xl" },
  xl: { px: 128, className: "h-28 w-28 text-3xl sm:h-32 sm:w-32 sm:text-4xl" },
} as const;

function userInitial(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "?";
  return source.charAt(0).toUpperCase();
}

/**
 * Circular avatar — photo when set, otherwise first letter of name/email.
 */
export function UserAvatar({
  name,
  email,
  image,
  size = "sm",
  className,
}: UserAvatarProps) {
  const { px, className: sizeClass } = sizes[size];
  const initial = userInitial(name, email);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-cream/20 bg-stage font-medium text-cream",
        sizeClass,
        className,
      )}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          width={px}
          height={px}
          unoptimized
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
    </span>
  );
}
