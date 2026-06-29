import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#070b13",
};

export const metadata: Metadata = {
  title: "Antigravity - Screenshot X/Twitter Posts with Style",
  description: "Turn Twitter/X posts and profiles into clean, beautiful screenshots and social media graphics designed for Instagram, LinkedIn, and more.",
  keywords: ["twitter screenshot", "x post customizer", "tweet card", "social media graphics"],
  openGraph: {
    title: "Antigravity - Screenshot X/Twitter Posts with Style",
    description: "Turn Twitter/X posts into premium social media graphics.",
    type: "website",
  },
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
