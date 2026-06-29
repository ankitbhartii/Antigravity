"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Share2, Palette, Image as ImageIcon, Layers } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      router.push(`/dashboard?url=${encodeURIComponent(url.trim())}`);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#070b13]">
      
      {/* Background Graphic Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full glow-orb"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full glow-orb"></div>
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 grid-pattern pointer-events-none opacity-40"></div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Sparkly Logo */}
          <div className="bg-gradient-to-tr from-sky-400 to-indigo-500 p-2 rounded-xl shadow-lg shadow-sky-500/10">
            <Sparkles className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            ANTIGRAVITY
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
          <a href="/dashboard" className="hover:text-white transition-colors">Workspace</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">Extensions</a>
        </nav>
        <button 
          onClick={() => router.push("/dashboard")} 
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-[0.98] cursor-pointer"
        >
          Open App
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-20 pb-28 text-center flex-1 flex flex-col justify-center items-center">
        
        {/* Sparkle badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-500/5 text-sky-400 text-xs font-semibold mb-6 shadow-inner tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          NEXT-GEN SCREENSHOT CUSTOMIZER
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Screenshots with <br />
          <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent text-glow">
            Absolute Style
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
          Turn your X (Twitter) posts, quotes, and profiles into clean, premium graphics tailored for Instagram, LinkedIn, and social feeds.
        </p>

        {/* Input Form */}
        <form onSubmit={handleStart} className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-2xl backdrop-blur-lg mb-16">
          <div className="flex-1 flex items-center gap-3 px-3">
            <span className="text-slate-500 font-medium text-sm shrink-0">URL:</span>
            <input
              type="url"
              placeholder="Paste X post or profile link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-transparent border-0 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 text-base"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Create Screenshot
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl text-left mt-6">
          
          {/* Card 1 */}
          <div className="bg-slate-900/30 border border-slate-800/60 p-5 rounded-2xl flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="text-base font-bold text-slate-200">10+ Unique Layouts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Standard, Chat Bubble, Quote, Monospace Console, and Magazine cards to match your message aesthetic.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/30 border border-slate-800/60 p-5 rounded-2xl flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-slate-200">Curated Themes</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vibrant light, deep dark, autumn reds, pattern blues, pistachio greens, and neon accents built-in.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/30 border border-slate-800/60 p-5 rounded-2xl flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-200">Social Sizing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Auto-wrap content or format instantly into 1:1 Squares for Instagram feeds and 9:16 for Stories.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#04070c] py-12 relative z-10 w-full">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-400">
              ANTIGRAVITY © 2026
            </span>
          </div>
          <div className="flex gap-6 text-xs text-slate-500 font-medium">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Support</a>
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-slate-500 hover:text-sky-400 transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="text-slate-500 hover:text-pink-400 transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="#" className="text-slate-500 hover:text-sky-600 transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
