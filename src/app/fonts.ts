import {
  Albert_Sans,
  Archivo,
  Chivo,
  Chivo_Mono,
  DM_Mono,
  DM_Sans,
  Epilogue,
  Familjen_Grotesk,
  Funnel_Display,
  Funnel_Sans,
  Gantari,
  Geist,
  Geist_Mono,
  Hanken_Grotesk,
  Host_Grotesk,
  Hubot_Sans,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Instrument_Sans,
  Inter,
  Inter_Tight,
  JetBrains_Mono,
  Jost,
  Libre_Franklin,
  Manrope,
  Martian_Mono,
  Mona_Sans,
  Outfit,
  Public_Sans,
  Red_Hat_Display,
  Red_Hat_Mono,
  Red_Hat_Text,
  Schibsted_Grotesk,
  Sora,
  Space_Grotesk,
  Urbanist,
  Wix_Madefor_Display,
  Wix_Madefor_Text,
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

// Third round of pairings.
const chivo = Chivo({ subsets: ["latin"], variable: "--font-chivo", display: "swap", preload: false });
const chivoMono = Chivo_Mono({ subsets: ["latin"], variable: "--font-chivo-mono", display: "swap", preload: false });
const funnelDisplay = Funnel_Display({ subsets: ["latin"], variable: "--font-funnel-display", display: "swap", preload: false });
const funnelSans = Funnel_Sans({ subsets: ["latin"], variable: "--font-funnel-sans", display: "swap", preload: false });
const hostGrotesk = Host_Grotesk({ subsets: ["latin"], variable: "--font-host", display: "swap", preload: false });
const wixDisplay = Wix_Madefor_Display({ subsets: ["latin"], variable: "--font-wix-display", display: "swap", preload: false });
const wixText = Wix_Madefor_Text({ subsets: ["latin"], variable: "--font-wix-text", display: "swap", preload: false });
const familjen = Familjen_Grotesk({ subsets: ["latin"], variable: "--font-familjen", display: "swap", preload: false });
const hubot = Hubot_Sans({ subsets: ["latin"], variable: "--font-hubot", display: "swap", preload: false });
const mona = Mona_Sans({ subsets: ["latin"], variable: "--font-mona", display: "swap", preload: false });
const urbanist = Urbanist({ subsets: ["latin"], variable: "--font-urbanist", display: "swap", preload: false });
const franklin = Libre_Franklin({ subsets: ["latin"], variable: "--font-franklin", display: "swap", preload: false });
const gantari = Gantari({ subsets: ["latin"], variable: "--font-gantari", display: "swap", preload: false });
const martian = Martian_Mono({ subsets: ["latin"], variable: "--font-martian", display: "swap", preload: false });
const epilogue = Epilogue({ subsets: ["latin"], variable: "--font-epilogue", display: "swap", preload: false });

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
  chivo,
  chivoMono,
  funnelDisplay,
  funnelSans,
  hostGrotesk,
  wixDisplay,
  wixText,
  familjen,
  hubot,
  mona,
  urbanist,
  franklin,
  gantari,
  martian,
  epilogue,
]
  .map((font) => font.variable)
  .join(" ");
