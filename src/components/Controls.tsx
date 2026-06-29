"use client";

import React, { useState } from "react";
import { useAppStore, LayoutKey, SizeKey, ThemeKey, THEMES, FrameKey } from "@/store/useAppStore";
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

  const frames: { key: FrameKey; label: string; desc: string }[] = [
    { key: "none", label: "No Frame", desc: "Clean card with no border wrap" },
    { key: "macos", label: "macOS Window", desc: "Browser-like mockup title bar" },
    { key: "mobile", label: "Mobile Mock", desc: "Smartphone silhouette outline" },
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
    <div className="flex flex-col gap-5 sm:gap-6 bg-slate-900/40 border border-slate-800 p-4 sm:p-6 rounded-2xl backdrop-blur-md w-full max-w-full lg:max-w-md no-scrollbar overflow-y-auto max-h-[40vh] lg:max-h-[calc(100vh-140px)]">
      
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

      {/* 5. Mockup Frame Select */}
      <div className="flex flex-col gap-2.5">
        <span className="text-sm font-semibold text-slate-300">Mockup Frame</span>
        <div className="grid grid-cols-3 gap-2">
          {frames.map((f) => (
            <button
              key={f.key}
              onClick={() => updateStyleOption("frame", f.key)}
              className={`p-2.5 rounded-xl border text-center flex flex-col gap-1 transition-all ${
                styleOptions.frame === f.key
                  ? "bg-sky-500/10 border-sky-500 text-sky-400 shadow-md shadow-sky-500/5"
                  : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <span className="text-xs font-bold">{f.label}</span>
              <span className="text-[9px] opacity-70 leading-tight">{f.desc}</span>
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

      {/* 6.5. 3D Perspective Tilt */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <span className="text-base">📐</span>
          3D Perspective Tilt
          {(styleOptions.tiltX !== 0 || styleOptions.tiltY !== 0) && (
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold tracking-wide">LIVE</span>
          )}
        </label>

        {/* Preset Buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "Flat", x: 0, y: 0, p: 900 },
            { label: "Gentle", x: -6, y: 8, p: 900 },
            { label: "Drama", x: -12, y: 16, p: 700 },
            { label: "Cinema", x: -18, y: 22, p: 500 },
          ].map((preset) => {
            const isActive = styleOptions.tiltX === preset.x && styleOptions.tiltY === preset.y && styleOptions.perspective === preset.p;
            return (
              <button
                key={preset.label}
                onClick={() => {
                  updateStyleOption("tiltX", preset.x);
                  updateStyleOption("tiltY", preset.y);
                  updateStyleOption("perspective", preset.p);
                }}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                  isActive
                    ? "bg-indigo-500/20 border-indigo-500/60 text-indigo-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Tilt X — Vertical axis */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Tilt X <span className="text-slate-600">(up/down)</span></span>
            <span className="font-mono text-indigo-400 font-bold w-12 text-right">{styleOptions.tiltX > 0 ? "+" : ""}{styleOptions.tiltX}°</span>
          </div>
          <input
            type="range"
            min={-30}
            max={30}
            step={1}
            value={styleOptions.tiltX}
            onChange={(e) => updateStyleOption("tiltX", Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-slate-800 accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Tilt Y — Horizontal axis */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Tilt Y <span className="text-slate-600">(left/right)</span></span>
            <span className="font-mono text-indigo-400 font-bold w-12 text-right">{styleOptions.tiltY > 0 ? "+" : ""}{styleOptions.tiltY}°</span>
          </div>
          <input
            type="range"
            min={-30}
            max={30}
            step={1}
            value={styleOptions.tiltY}
            onChange={(e) => updateStyleOption("tiltY", Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-slate-800 accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Perspective Depth */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Depth <span className="text-slate-600">(perspective)</span></span>
            <span className="font-mono text-indigo-400 font-bold w-14 text-right">{styleOptions.perspective}px</span>
          </div>
          <input
            type="range"
            min={300}
            max={1600}
            step={50}
            value={styleOptions.perspective}
            onChange={(e) => updateStyleOption("perspective", Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-slate-800 accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-600 font-medium px-0.5">
            <span>Close (dramatic)</span>
            <span>Far (subtle)</span>
          </div>
        </div>

        {/* Float Effect toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none mt-1">
          <div
            onClick={() => updateStyleOption("floatEffect", !styleOptions.floatEffect)}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer border ${
              styleOptions.floatEffect ? "bg-indigo-500 border-indigo-400" : "bg-slate-800 border-slate-700"
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${styleOptions.floatEffect ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-xs text-slate-300 font-medium">
            ✨ Floating animation
            <span className="ml-1.5 text-slate-500">(on hover)</span>
          </span>
        </label>

        {/* Mouse-follow hint */}
        <p className="text-[10px] text-slate-600 leading-relaxed">
          💡 In the preview, hover the card to activate live mouse-follow tilt.
        </p>
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
