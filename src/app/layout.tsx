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

export const metadata: Metadata = {
  title: `${profile.name} | ${profile.title}`,
  description: `Portfolio of ${profile.name}, ${profile.title}.`,
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
