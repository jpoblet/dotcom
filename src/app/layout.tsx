import "./globals.css";
import { DM_Mono } from "next/font/google";

import Script from "next/script";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata = {
  title: "Jordi Poblet | Product Designer & Design Engineer",
  description: "Portfolio of Jordi Poblet, Product Designer & Design Engineer.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmMono.variable} suppressHydrationWarning>
      <head>
        <Script src="https://api.tempo.new/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      </head>
      <body className="font-sans">
        <main className="pt-0">{children}</main>
      </body>
    </html>
  );
}
