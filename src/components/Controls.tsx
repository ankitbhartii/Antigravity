"use client";

import React, { useState } from "react";
import { useAppStore, LayoutKey, SizeKey, ThemeKey, THEMES } from "@/store/useAppStore";
import { Check, Info, RefreshCw, Sparkles, Link } from "lucide-react";

export const Controls: React.FC = () => {
  const { tweetData, styleOptions, status, updateTweetData, updateStyleOption, loadMockTweet } = useAppStore();
  const [urlInput, setUrlInput] = useState("");

  const layouts: { key: LayoutKey; label: string; desc: string }[] = [
    { key: "standard", label: "Standard", desc: "Classic Twitter web post layout" },
    { key: "bubble1", label: "Bubble I", desc: "Left-aligned iMessage chat bubble style" },
    { key: "bubble2", label: "Bubble II", desc: "Right-aligned self chat bubble style" },
    { key: "fab", label: "Fab Bold", desc: "Minimalist layout with accent line" },
    { key: "iconic", label: "Iconic", desc: "Circular avatar offset magazine style" },
    { key: "nova1", label: "Nova I", desc: "Futuristic monospace console style" },
    { key: "nova2", label: "Nova II", desc: "Monospace style with active meter" },
    { key: "quote", label: "Quote", desc: "Enclosed in large styled quotes" },
    { key: "simple", label: "Simple", desc: "Clean text view without border card" },
    { key: "square", label: "Square Block", desc: "Accent outlined square layout" },
    { key: "highlighted", label: "Highlight Center", desc: "High-contrast marker highlight style" },
    { key: "focused", label: "Focused Top", desc: "Avatar top centered focus style" },
  ];

  const sizes: { key: SizeKey; label: string; aspect: string }[] = [
    { key: "auto", label: "Auto Fit", aspect: "Fits card bounds" },
    { key: "ig_post", label: "Instagram Post", aspect: "1:1 Square" },
    { key: "ig_story", label: "Instagram Story", aspect: "9:16 Vertical" },
  ];

  const handleFetchTweet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    // Simulate fetching or trigger state changes
    // In a complete client flow, we will call /api/generate
    useAppStore.setState({ status: "loading" });
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tweet. Using fallback details.");
      }

      const data = await response.json();
      if (data && data.tweet) {
        // Load fetched tweet
        Object.entries(data.tweet).forEach(([key, value]) => {
          updateTweetData(key as any, value as any);
        });
        useAppStore.setState({ status: "success" });
      } else {
        throw new Error("Invalid tweet data received.");
      }
    } catch (err: any) {
      console.warn(err.message);
      // Fallback: mock a quick parse based on the input or just notify
      useAppStore.setState({ 
        status: "error", 
        errorMessage: err.message || "Failed to load tweet. Editing inline enabled." 
      });
      setTimeout(() => useAppStore.setState({ status: "idle" }), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-md max-w-md w-full no-scrollbar overflow-y-auto max-h-[calc(100vh-140px)]">
      
      {/* 1. Paste Tweet Link */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
          <Link className="w-4 h-4 text-sky-400" />
          Import Tweet URL
        </label>
        <form onSubmit={handleFetchTweet} className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://x.com/username/status/..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-200 transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            {status === "loading" ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Load
          </button>
        </form>
        {status === "error" && (
          <p className="text-xs text-rose-400 font-medium bg-rose-950/20 border border-rose-900/30 px-3 py-1.5 rounded-lg flex items-center gap-1">
            <Info className="w-3.5 h-3.5 shrink-0" />
            Failed to fetch. Customizing inline is fully supported!
          </p>
        )}
      </div>

      <hr className="border-slate-800" />

      {/* 2. Layout Select */}
      <div className="flex flex-col gap-2.5">
        <span className="text-sm font-semibold text-slate-300">Choose Layout</span>
        <div className="grid grid-cols-2 gap-2">
          {layouts.map((l) => (
            <button
              key={l.key}
              onClick={() => updateStyleOption("layout", l.key)}
              className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                styleOptions.layout === l.key
                  ? "bg-sky-500/10 border-sky-500 text-sky-400 shadow-md shadow-sky-500/5"
                  : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <span className="text-xs font-bold">{l.label}</span>
              <span className="text-[10px] opacity-70 leading-tight">{l.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-800" />

      {/* 3. Theme Color Pickers */}
      <div className="flex flex-col gap-2.5">
        <span className="text-sm font-semibold text-slate-300">Color Swatch</span>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(THEMES).map(([key, t]) => {
            const isSelected = styleOptions.theme === key;
            return (
              <button
                key={key}
                onClick={() => updateStyleOption("theme", key as ThemeKey)}
                title={t.name}
                className={`w-11 h-11 rounded-full relative flex items-center justify-center border-2 transition-all ${
                  isSelected ? "border-sky-400 scale-105" : "border-slate-800 hover:scale-105"
                }`}
                style={{ backgroundColor: t.background }}
              >
                {/* Secondary swatch indicator */}
                <span
                  className="w-3.5 h-3.5 rounded-full absolute bottom-1 right-1 border border-black/30"
                  style={{ backgroundColor: t.accent }}
                ></span>
                {isSelected && (
                  <Check
                    className="w-5 h-5"
                    style={{ color: t.isDark ? "#ffffff" : "#000000" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-800" />

      {/* 4. Canvas Sizing */}
      <div className="flex flex-col gap-2.5">
        <span className="text-sm font-semibold text-slate-300">Aspect Ratio</span>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((s) => (
            <button
              key={s.key}
              onClick={() => updateStyleOption("size", s.key)}
              className={`p-2.5 rounded-xl border text-center flex flex-col gap-1 transition-all ${
                styleOptions.size === s.key
                  ? "bg-sky-500/10 border-sky-500 text-sky-400 shadow-md shadow-sky-500/5"
                  : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <span className="text-xs font-bold">{s.label}</span>
              <span className="text-[9px] opacity-70 leading-tight">{s.aspect}</span>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-800" />

      {/* 5. Custom Sliders: Padding & Corners */}
      <div className="flex flex-col gap-4">
        {/* Padding Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Canvas Padding</span>
            <span className="text-sky-400">{styleOptions.padding}px</span>
          </div>
          <input
            type="range"
            min="16"
            max="128"
            value={styleOptions.padding}
            onChange={(e) => updateStyleOption("padding", parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none"
          />
        </div>

        {/* Rounded corners Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Border Radius</span>
            <span className="text-sky-400">{styleOptions.rounded}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="32"
            value={styleOptions.rounded}
            onChange={(e) => updateStyleOption("rounded", parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none"
          />
        </div>
      </div>

      <hr className="border-slate-800" />

      {/* 6. Layout Toggles */}
      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-slate-300">Visual Options</span>
        <div className="grid grid-cols-2 gap-3 text-xs">
          
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={styleOptions.showMetrics}
              onChange={(e) => updateStyleOption("showMetrics", e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900 w-4 h-4"
            />
            Show Metrics
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={styleOptions.showAvatars}
              onChange={(e) => updateStyleOption("showAvatars", e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900 w-4 h-4"
            />
            Show Profile Avatar
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={styleOptions.showWatermark}
              onChange={(e) => updateStyleOption("showWatermark", e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900 w-4 h-4"
            />
            Watermark Brand
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={styleOptions.shadow}
              onChange={(e) => updateStyleOption("shadow", e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900 w-4 h-4"
            />
            Drop Shadow
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none col-span-2">
            <input
              type="checkbox"
              checked={styleOptions.filled}
              onChange={(e) => updateStyleOption("filled", e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900 w-4 h-4"
            />
            Fill Canvas Background Color
          </label>

        </div>
      </div>

      <hr className="border-slate-800" />

      {/* 7. Load Template */}
      <button
        onClick={loadMockTweet}
        className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Reset to Default Template
      </button>

    </div>
  );
};
