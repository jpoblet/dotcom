import { DM_Mono, DM_Sans } from "next/font/google";

/*
 * The site's type: DM Mono for everything (headings, labels, numbers, the
 * interface) except body text, which is DM Sans (see globals.css).
 */
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const fontVariables = `${dmSans.variable} ${dmMono.variable}`;
