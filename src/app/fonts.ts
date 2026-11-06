import {
  DM_Mono,
  DM_Sans,
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Inter,
  Jost,
  Space_Grotesk,
} from "next/font/google";

/*
 * Font pairings to try out (see components/FontSwitcher.tsx). Each sets a
 * heading face and a body face through CSS variables in globals.css. Only
 * the default pairing's fonts are preloaded; the others load on demand.
 */

const jost = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-sans",
  display: "swap",
  preload: false,
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
});
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap", preload: false });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: false,
});
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap", preload: false });
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
  preload: false,
});

export const fontVariables = [
  jost,
  inter,
  plexSans,
  plexMono,
  geist,
  geistMono,
  spaceGrotesk,
  dmSans,
  dmMono,
]
  .map((font) => font.variable)
  .join(" ");
