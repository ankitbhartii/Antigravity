import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Antigravity - Screenshot X/Twitter Posts with Style",
  description: "Turn Twitter/X posts and profiles into clean, beautiful screenshots and social media graphics designed for Instagram, LinkedIn, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#0a0e17] text-[#f8fafc] no-scrollbar">
        {children}
      </body>
    </html>
  );
}
