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
    id: "neo-grotesk",
    name: "Neo-grotesk",
    faces: "Inter Tight + Inter",
    note: "Closest to the Akzidenz and Helvetica lineage of Rams' Braun work: a tighter display cut over the text face.",
  },
  {
    id: "newspaper",
    name: "Newspaper grotesque",
    faces: "Schibsted Grotesk + Public Sans",
    note: "Editorial weight in the headings, civic neutrality in the text.",
  },
  {
    id: "instrument",
    name: "Instrument",
    faces: "Instrument Sans + JetBrains Mono",
    note: "Precise and compact, like a measuring tool, with monospaced labels.",
  },
  {
    id: "systematic",
    name: "Systematic",
    faces: "Red Hat Display + Text + Mono",
    note: "A complete type system: display, text and mono designed together.",
  },
  {
    id: "modernist",
    name: "Modernist",
    faces: "Manrope + IBM Plex Mono",
    note: "Semi-geometric and calm, with engineered labels.",
  },
  {
    id: "grotesque-revival",
    name: "Grotesque revival",
    faces: "Archivo",
    note: "A revival of 19th-century grotesques: sturdy, plain, honest.",
  },
  {
    id: "geometric",
    name: "Geometric",
    faces: "Sora + Inter",
    note: "Constructed, technical headings over a neutral text face.",
  },
  {
    id: "bauhaus-2",
    name: "Bauhaus II",
    faces: "Outfit + Public Sans",
    note: "Pure circles and lines in the headings, a quiet workhorse for reading.",
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    faces: "Albert Sans",
    note: "Geometric with a little warmth, inspired by Scandinavian modernism.",
  },
  {
    id: "utility",
    name: "Utility",
    faces: "Hanken Grotesk + JetBrains Mono",
    note: "Unadorned and functional, with monospaced labels.",
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
