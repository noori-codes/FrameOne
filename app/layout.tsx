import type { Metadata } from "next";
import { Big_Shoulders, Fraunces, Source_Sans_3 } from "next/font/google";
import { Suspense } from "react";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { NavigationProgress } from "@/components/navigation-progress";
import { SiteHeader } from "@/components/site-header";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

/**
 * Root layout wraps EVERY page.
 * - fonts + metadata live here so they apply site-wide
 * - SiteHeader stays mounted across navigations (layout does not remount)
 *
 * Type roles:
 * - marquee (Big Shoulders) — brand + hero titles (poster condensed)
 * - display (Fraunces) — section / page headlines (warm editorial)
 * - body (Source Sans 3) — UI copy
 */
const marquee = Big_Shoulders({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-marquee",
});

const display = Fraunces({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "FrameOne",
    template: "%s · FrameOne",
  },
  description: "Discover movies with a cinematic UI.",
  icons: {
    icon: "/brand/logo-dark.png",
    apple: "/brand/logo-dark.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${marquee.variable} ${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-background pb-16 text-foreground md:pb-0">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {/* Auth is JWT-only on the hot path, but still dynamic — don’t block page shell. */}
        <Suspense fallback={<SiteNav user={null} />}>
          <SiteHeader />
        </Suspense>
        {children}
        <MobileTabBar />
      </body>
    </html>
  );
}
