import './globals.css';
import { Space_Grotesk } from 'next/font/google';
import Header from '../components/Header';
import { ThemeProvider } from '../components/ThemeProvider';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata = {
  title: 'Jordi Poblet | Product Designer',
  description: 'Portfolio of Jordi Poblet, Product Designer.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
