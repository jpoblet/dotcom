import "./globals.css";
import type { Metadata, Viewport } from "next";
import { DM_Mono } from "next/font/google";
import { getProfile } from "@/lib/content";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

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
// a white flash. Must stay in sync with the theme switcher in Chat.tsx.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmMono.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
