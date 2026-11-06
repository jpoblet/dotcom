import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import SiteFooter from "@/components/SiteFooter";
import { fontVariables } from "./fonts";
import { getProfile } from "@/lib/content";

const profile = getProfile();

// Absolute base for the Open Graph / Twitter image URLs. Set NEXT_PUBLIC_SITE_URL
// to override; on Vercel the production domain is picked up automatically.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://jordipoblet.com");

const title = `${profile.name} | ${profile.title}`;
const description = `Portfolio of ${profile.name}, ${profile.title}.`;

// Icons and preview images come from the file conventions in this folder:
// icon.svg, favicon.ico, apple-icon.tsx, opengraph-image.tsx, twitter-image.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    type: "website",
    url: "/",
    siteName: profile.name,
    title,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Let the page draw under the iPhone notch / home indicator; the header,
  // footer and input box pad themselves with env(safe-area-inset-*).
  viewportFit: "cover",
  // On Android, shrink the layout when the keyboard opens so the fixed input
  // box stays above it.
  interactiveWidget: "resizes-content",
};

// Applies the saved theme before first paint, so dark-mode visitors don't see
// a light flash. Must stay in sync with components/ThemeSwitcher.tsx.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;


// Umami analytics (cookieless). The website id is public by design. Events
// are only recorded on the live domains, so local runs and previews don't
// count.
const UMAMI_WEBSITE_ID = "c9feed1a-4c35-42a6-96df-97d07e0bf709";

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  /** Project case studies opened as a modal (see app/@modal). */
  modal: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="font-sans">
        {/* Next puts beforeInteractive scripts in the head, ahead of
            hydration, so React never renders a raw <script> itself. */}
        <Script id="theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        {children}
        <SiteFooter email={profile.email} links={profile.links} />
        {modal}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id={UMAMI_WEBSITE_ID}
          data-domains="www.jordipoblet.com,jordipoblet.com"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
