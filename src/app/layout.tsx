import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import Script from "next/script";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata = {
  title: "Jordi Poblet | Product Designer",
  description: "Portfolio of Jordi Poblet, Product Designer.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
      <head>
        <Script src="https://api.tempo.new/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      </head>
      <body className="font-sans">
        <main className="pt-0">{children}</main>
      </body>
    </html>
  );
}
