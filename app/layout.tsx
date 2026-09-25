import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

/**
 * Root layout wraps EVERY page.
 * - fonts + metadata live here so they apply site-wide
 * - SiteHeader stays mounted across navigations (layout does not remount)
 */
const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Frameone",
  description: "Discover movies with a cinematic UI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
