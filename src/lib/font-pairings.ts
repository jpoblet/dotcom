/** The font pairings to compare. CSS for each lives in globals.css. */
export const FONT_PAIRINGS = [
  {
    id: "bauhaus",
    name: "Bauhaus",
    faces: "Jost + Inter",
    note: "Geometric headings in the Futura tradition, over a neutral, highly legible text face.",
  },
  {
    id: "engineered",
    name: "Engineered",
    faces: "IBM Plex Sans + Plex Mono",
    note: "A rational corporate grotesque with a monospaced companion for labels and data.",
  },
  {
    id: "swiss",
    name: "Swiss contemporary",
    faces: "Geist + Geist Mono",
    note: "Precise, reduced, in the Swiss tradition: as little design as possible.",
  },
  {
    id: "grotesk",
    name: "Grotesk",
    faces: "Space Grotesk + Inter",
    note: "A grotesque with character for headings, quiet Inter underneath.",
  },
  {
    id: "dm",
    name: "DM family",
    faces: "DM Sans + DM Mono",
    note: "Keeps the DM character you like, with a proportional face for reading.",
  },
  {
    id: "original",
    name: "Original",
    faces: "DM Mono",
    note: "Today's site: monospaced throughout.",
  },
] as const;

export type FontPairingId = (typeof FONT_PAIRINGS)[number]["id"];
export const DEFAULT_PAIRING: FontPairingId = "bauhaus";
export const FONT_STORAGE_KEY = "font-pairing";
