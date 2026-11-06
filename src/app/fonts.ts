import { DM_Mono, DM_Sans } from "next/font/google";

/*
 * The site's type: DM Sans throughout, and DM Mono for the name, project
 * names and roles, numbers, dates and addresses (see globals.css).
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
