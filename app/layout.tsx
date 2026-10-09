import type { Metadata } from "next";
import { Geist, Geist_Mono, Bangers } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { FloatingComicWords } from "@/components/ui/FloatingComicWords";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bangers = Bangers({
  weight: "400",
  variable: "--font-bangers",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rubixify – The Ultimate Rubik's Cube Algorithm Database",
  description:
    "Learn, search and practice CFOP algorithms. F2L, OLL and PLL algorithms for speedcubers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${bangers.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <FloatingComicWords />
        <Navbar />
        <main className="flex-1 relative z-10">{children}</main>
        <footer
          className="relative z-10 py-5 text-center text-xs font-semibold"
          style={{
            borderTop: '3px solid #0A0A0A',
            background: '#FFD500',
            color: '#0A0A0A',
          }}
        >
          <p>
            <span
              style={{
                fontFamily: 'var(--font-bangers, Bangers, cursive)',
                fontSize: '1rem',
                letterSpacing: '0.08em',
              }}
            >
              Rubixify
            </span>
            {' '}© {new Date().getFullYear()} — The Ultimate Speedcubing Algorithm Database
          </p>
        </footer>
      </body>
    </html>
  );
}
