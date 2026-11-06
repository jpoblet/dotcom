import {
  Albert_Sans,
  Archivo,
  DM_Mono,
  DM_Sans,
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Inter,
  Hanken_Grotesk,
  Instrument_Sans,
  Inter_Tight,
  JetBrains_Mono,
  Jost,
  Manrope,
  Outfit,
  Public_Sans,
  Red_Hat_Display,
  Red_Hat_Mono,
  Red_Hat_Text,
  Schibsted_Grotesk,
  Sora,
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

// Second round of pairings.
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap", preload: false });
const schibsted = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted", display: "swap", preload: false });
const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-public-sans", display: "swap", preload: false });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap", preload: false });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", preload: false });
const redHatDisplay = Red_Hat_Display({ subsets: ["latin"], variable: "--font-redhat-display", display: "swap", preload: false });
const redHatText = Red_Hat_Text({ subsets: ["latin"], variable: "--font-redhat-text", display: "swap", preload: false });
const redHatMono = Red_Hat_Mono({ subsets: ["latin"], variable: "--font-redhat-mono", display: "swap", preload: false });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap", preload: false });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap", preload: false });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap", preload: false });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap", preload: false });
const albert = Albert_Sans({ subsets: ["latin"], variable: "--font-albert", display: "swap", preload: false });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap", preload: false });

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
  interTight,
  schibsted,
  publicSans,
  instrument,
  jetbrains,
  redHatDisplay,
  redHatText,
  redHatMono,
  manrope,
  archivo,
  sora,
  outfit,
  albert,
  hanken,
]
  .map((font) => font.variable)
  .join(" ");
