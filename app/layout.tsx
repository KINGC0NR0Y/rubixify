import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { GlobalBackground } from "@/components/ui/GlobalBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CuboPedia – The Ultimate Rubik's Cube Algorithm Database",
  description:
    "Learn, search and practice CFOP algorithms. F2L, OLL, PLL and advanced algorithms for speedcubers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col">
        <GlobalBackground />
        <Navbar />
        <main className="flex-1 relative z-10">{children}</main>
        <footer
          className="relative z-10 border-t py-6 text-center text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--fg-3)' }}
        >
          <p>
            <span style={{ color: 'var(--fg-2)' }}>CuboPedia</span>
            {' '}© {new Date().getFullYear()} — The Ultimate Speedcubing Algorithm Database
          </p>
        </footer>
      </body>
    </html>
  );
}
