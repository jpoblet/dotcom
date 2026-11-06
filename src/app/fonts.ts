import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next } from "next/font/google";

/*
 * The site's type: Atkinson Hyperlegible Next for text and headings, and
 * Atkinson Hyperlegible Mono for labels (see globals.css).
 */
const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
});
const atkinsonMono = Atkinson_Hyperlegible_Mono({
  subsets: ["latin"],
  variable: "--font-atkinson-mono",
  display: "swap",
});

export const fontVariables = `${atkinson.variable} ${atkinsonMono.variable}`;
