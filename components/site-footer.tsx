import type { ReactNode } from "react";
import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const EXPLORE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse/trending", label: "Trending" },
  { href: "/genres", label: "Genres" },
] as const;

const ACCOUNT_LINKS = [
  { href: "/watchlist", label: "My List" },
  { href: "/profile", label: "Profile" },
] as const;

const SOCIAL = {
  github: "https://github.com/noori-codes",
  linkedin: "https://www.linkedin.com/in/imran-noori",
  email: "mailto:imrannoori1919@gmail.com",
} as const;

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function FooterNavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative w-fit text-sm tracking-wide text-cream/55 transition-colors duration-300",
        "hover:text-cream",
      )}
    >
      {label}
      <span
        aria-hidden
        className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-amber transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
    </Link>
  );
}

function SocialIconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      aria-label={label}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="inline-flex size-9 items-center justify-center rounded-full border border-cream/12 text-cream/50 transition-[color,border-color,background-color] duration-300 hover:border-amber/50 hover:bg-amber/5 hover:text-amber"
    >
      {children}
    </a>
  );
}

/**
 * End-credits footer — brand, nav, social, TMDB attribution.
 */
export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto border-t border-cream/[0.06] bg-[#060809]">
      <div className="mx-auto w-full max-w-screen-2xl px-4 pt-14 pb-8 sm:px-6 sm:pt-16 sm:pb-10 lg:px-10 lg:pt-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4 md:gap-x-10 lg:gap-x-16">
          {/* Brand */}
          <div className="col-span-2 space-y-4 md:col-span-1">
            <Link
              href="/"
              aria-label="FrameOne home"
              className="group inline-flex items-center gap-3"
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[3px] border border-amber/35 bg-stage/80 font-display text-[15px] leading-none tracking-[0.08em] text-amber transition-colors duration-300 group-hover:border-amber/60 group-hover:bg-amber/5">
                F1
              </span>
              <span className="font-display text-2xl leading-none tracking-[0.18em] text-cream uppercase transition-colors duration-300 group-hover:text-amber">
                FrameOne
              </span>
            </Link>
            <p className="max-w-[16rem] text-[13px] leading-relaxed tracking-wide text-cream/40">
              Discover. Save. Watch.
            </p>
          </div>

          {/* Explore */}
          <nav aria-label="Explore" className="flex flex-col gap-3.5">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-cream/30 uppercase">
              Explore
            </p>
            <div className="flex flex-col gap-3">
              {EXPLORE_LINKS.map((link) => (
                <FooterNavLink key={link.href} {...link} />
              ))}
            </div>
          </nav>

          {/* Account */}
          <nav aria-label="Account" className="flex flex-col gap-3.5">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-cream/30 uppercase">
              Account
            </p>
            <div className="flex flex-col gap-3">
              {ACCOUNT_LINKS.map((link) => (
                <FooterNavLink key={link.href} {...link} />
              ))}
            </div>
          </nav>

          {/* Connect */}
          <div className="col-span-2 flex flex-col gap-3.5 md:col-span-1">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-cream/30 uppercase">
              Connect
            </p>
            <div className="flex items-center gap-2.5">
              <SocialIconLink href={SOCIAL.github} label="GitHub">
                <GitHubIcon className="size-4" />
              </SocialIconLink>
              <SocialIconLink href={SOCIAL.linkedin} label="LinkedIn">
                <LinkedInIcon className="size-4" />
              </SocialIconLink>
              <SocialIconLink href={SOCIAL.email} label="Email Imran Noori">
                <Mail className="size-4" strokeWidth={1.6} aria-hidden />
              </SocialIconLink>
            </div>
            <a
              href={SOCIAL.email}
              className="mt-1 w-fit text-xs tracking-wide text-cream/35 transition-colors duration-300 hover:text-amber"
            >
              imrannoori1919@gmail.com
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-5 border-t border-cream/[0.05] pt-6 sm:mt-16 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <p className="text-[11px] leading-relaxed tracking-wide text-cream/30 sm:text-xs">
            © 2026 FrameOne. Designed & built by Imran Noori.
          </p>

          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex max-w-md items-start gap-3 text-[10px] leading-relaxed tracking-wide text-cream/28 transition-colors duration-300 hover:text-cream/45 sm:items-center sm:text-[11px]"
          >
            <Image
              src="/brand/tmdb-logo.svg"
              alt="TMDB"
              width={36}
              height={26}
              className="mt-0.5 h-[18px] w-auto shrink-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100 sm:mt-0 sm:h-5"
            />
            <span>
              This product uses the TMDB API but is not endorsed or certified by
              TMDB.
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
